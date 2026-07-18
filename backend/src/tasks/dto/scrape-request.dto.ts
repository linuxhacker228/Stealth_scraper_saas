import { ApiProperty } from '@nestjs/swagger';

export class ScrapeRequestDto {
    @ApiProperty({ description: 'The URL to scrape', example: 'https://example.com' })
    url: string;

    @ApiProperty({ description: 'Scraping mode', example: 'STEALTH', enum: ['FAST', 'STEALTH'] })
    type: 'FAST' | 'STEALTH';

    @ApiProperty({
        description: 'Optional mapping of keys to CSS selectors used to extract content from the page. Values should be valid CSS selectors.',
        required: false,
        example: { title: '.article h1', content: '.article .content' },
    })
    options?: Record<string, string>;
}