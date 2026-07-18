import {Processor, WorkerHost} from "@nestjs/bullmq";
import {PrismaService} from "../prisma/prisma.service";
import {Job} from "bullmq";
import {Status} from "@prisma/client"
import {chromium} from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import {load} from "cheerio";

chromium.use(stealthPlugin());

@Processor('scraper-queue')
export class TasksProcessor extends WorkerHost {
    private proxyArr: string[] = ['http://user1:pass1@203.0.113.10:8080',
                                  'http://user2:pass2@203.0.113.11:3128',];
    private userAgentArr: string[] = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 15.7; rv:152.0) Gecko/20100101 Firefox/152.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Vivaldi/8.1.4087.46',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.4078.65',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Trailer/93.3.8652.5',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 OPR/117.0.0.',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.3',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.1958',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.'
    ];
    constructor(private prismaService: PrismaService) {
        super();
    }
    async process(job: Job<{
        taskId: string;
        url: string;
        options?: any;
    }>){
        const {taskId, url, options} = job.data;
        console.log(`Task ${taskId} with url ${url} and the process is running in the background.`)
        await this.prismaService.scrapeTask.update({
            where: {
                id: taskId,
            },
            data: {
                status: Status.PROCESSING,
            }
        });
        const browser = await chromium.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']});
        try {
            const randomUserAgent = this.getRandomUserAgent();
            const randomProxy = this.getRandomProxy();
            const context = await browser.newContext({
                userAgent: randomUserAgent,
                viewport: {
                    width: 1280,
                    height: 720,
                },
                deviceScaleFactor: 1,
            });
            const newPage = await context.newPage();
            const response = await newPage.goto(url, {waitUntil: 'networkidle'});
            await this.simulateHumanInteraction(newPage);
            const html = await newPage.content();
            const statusCode = response?.status() || 200;
            let parsedData: Record<string, string> | undefined;
            if(options && typeof options === 'object') {
                const cheer = load(html);
                const selectors = options as Record<string, string>;
                const resultJson: Record<string, string> = {};
                for(const [key, selector] of Object.entries(selectors) ) {
                    resultJson[key] = cheer(selector).text().trim();
                    console.log(`The value of ${key} is ${resultJson[key]} and the value of the ${key} is ${resultJson[key]}`);
                }
                parsedData = resultJson;
            }
            await this.prismaService.scrapeResult.create({
                data: {
                    taskId,
                    statusCode,
                    rawHtml: html,
                    parsedData,
                }
            })
            await this.prismaService.scrapeTask.update({
                where: {
                    id: taskId,
                },
                data: {
                    status: Status.COMPLETED,
                }

            })
            console.log(`Task ${taskId} with url ${url} and the process is completed. The status of the task is ${statusCode}`);
        } catch (error) {
            await this.prismaService.scrapeTask.update({
                where: {
                    id: taskId,
                },
                data: {
                    status: Status.FAILED,
                }
            });
            await this.prismaService.scrapeResult.create({
                data: {
                    statusCode: 500,
                    taskId,
                    errorMessage: error.message,
                }
            })
            console.log(error)
        }
    }
    private async simulateHumanInteraction(page: any) {
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 150 + Math.random() * 100);
            })
        })
    }
    private getRandomUserAgent() {
        return this.userAgentArr[Math.floor(Math.random() * this.userAgentArr.length)];
    }
    private getRandomProxy() {
        const proxy = this.proxyArr[Math.floor(Math.random() * this.proxyArr.length)];
        const protocolIndex = proxy.indexOf('//');
        const ipIndex = proxy.indexOf('@');
        const server = proxy.slice(0, protocolIndex + 2) + proxy.slice(ipIndex + 1);
        const userAuth = proxy.slice(protocolIndex + 2, ipIndex);
        const username = userAuth.slice(0, userAuth.indexOf(':'));
        const password = userAuth.slice(userAuth.indexOf(':') + 1);
        console.log(`The username is ${username} and the password is ${password}`);
        return {
            server,
            username,
            password,
        }


    }
}
