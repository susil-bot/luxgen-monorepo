import { TenantTheme } from '../types';
import { defaultTheme } from '../theme';

export interface CarouselData {
  tenantTheme: TenantTheme;
  items: Array<{
    id: string;
    content: string;
    title?: string;
    description?: string;
  }>;
  autoPlay: boolean;
  autoPlayInterval: number;
  showArrows: boolean;
  showDots: boolean;
  showThumbnails: boolean;
  infinite: boolean;
  slidesToShow: number;
  slidesToScroll: number;
}

export const fetchCarouselData = async (
  tenantId?: string
): Promise<CarouselData> => {
  return {
    tenantTheme: defaultTheme,
    items: [
      {
        id: '1',
        content: 'Slide 1 content',
        title: 'Slide 1',
        description: 'First slide description',
      },
      {
        id: '2',
        content: 'Slide 2 content',
        title: 'Slide 2',
        description: 'Second slide description',
      },
      {
        id: '3',
        content: 'Slide 3 content',
        title: 'Slide 3',
        description: 'Third slide description',
      },
    ],
    autoPlay: false,
    autoPlayInterval: 3000,
    showArrows: true,
    showDots: true,
    showThumbnails: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
};

export const fetchCarouselSSR = async (
  tenantId?: string
): Promise<{ html: string; styles: string }> => {
  const data = await fetchCarouselData(tenantId);
  
  const html = `
    <div class="carousel" style="font-family: ${data.tenantTheme.fonts.primary}; color: ${data.tenantTheme.colors.text};">
      <div class="carousel-container">
        <div class="carousel-track">
          ${data.items.map((item, index) => `
            <div class="carousel-slide" style="transform: translateX(${index * 100}%); transition: transform 0.3s ease;">
              ${item.content}
            </div>
          `).join('')}
        </div>
        
        ${data.showArrows ? `
          <button class="carousel-arrow carousel-arrow-prev" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); background: ${data.tenantTheme.colors.background}; border: 1px solid ${data.tenantTheme.colors.border}; border-radius: 50%; width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; cursor: pointer; color: ${data.tenantTheme.colors.text}; font-size: 1.25rem; z-index: 2;">
            ‹
          </button>
          <button class="carousel-arrow carousel-arrow-next" style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: ${data.tenantTheme.colors.background}; border: 1px solid ${data.tenantTheme.colors.border}; border-radius: 50%; width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; cursor: pointer; color: ${data.tenantTheme.colors.text}; font-size: 1.25rem; z-index: 2;">
            ›
          </button>
        ` : ''}
      </div>
      
      ${data.showDots ? `
        <div class="carousel-dots" style="text-align: center; margin-top: 1rem;">
          ${data.items.map((_, index) => `
            <button class="carousel-dot ${index === 0 ? 'active' : ''}" style="width: 0.75rem; height: 0.75rem; border-radius: 50%; border: none; background: ${index === 0 ? data.tenantTheme.colors.primary : data.tenantTheme.colors.border}; margin: 0 0.25rem; cursor: pointer; transition: background-color 0.2s ease;"></button>
          `).join('')}
        </div>
      ` : ''}
      
      ${data.showThumbnails ? `
        <div class="carousel-thumbnails" style="margin-top: 1rem;">
          ${data.items.map((item, index) => `
            <button class="carousel-thumbnail ${index === 0 ? 'active' : ''}" style="width: 4rem; height: 3rem; border: 2px solid ${index === 0 ? data.tenantTheme.colors.primary : data.tenantTheme.colors.border}; border-radius: 0.375rem; background: ${data.tenantTheme.colors.background}; cursor: pointer; margin: 0 0.25rem; overflow: hidden; transition: border-color 0.2s ease;">
              ${item.content}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
  
  const styles = `
    .carousel {
      position: relative;
      overflow: hidden;
      font-family: var(--font-primary);
      color: var(--color-text);
    }
    
    .carousel-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    .carousel-track {
      display: flex;
      width: 100%;
      height: 100%;
    }
    
    .carousel-slide {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
    }
    
    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 50%;
      width: 3rem;
      height: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text);
      font-size: 1.25rem;
      z-index: 2;
      transition: all 0.2s ease;
    }
    
    .carousel-arrow:hover {
      background: var(--color-primary);
      color: var(--color-background);
    }
    
    .carousel-arrow:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .carousel-arrow-prev {
      left: 1rem;
    }
    
    .carousel-arrow-next {
      right: 1rem;
    }
    
    .carousel-dots {
      text-align: center;
      margin-top: 1rem;
    }
    
    .carousel-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      border: none;
      background: var(--color-border);
      margin: 0 0.25rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .carousel-dot.active {
      background: var(--color-primary);
    }
    
    .carousel-dot:hover {
      background: var(--color-primary);
      opacity: 0.7;
    }
    
    .carousel-thumbnails {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .carousel-thumbnail {
      width: 4rem;
      height: 3rem;
      border: 2px solid var(--color-border);
      border-radius: 0.375rem;
      background: var(--color-background);
      cursor: pointer;
      margin: 0 0.25rem;
      overflow: hidden;
      transition: border-color 0.2s ease;
    }
    
    .carousel-thumbnail.active {
      border-color: var(--color-primary);
    }
    
    .carousel-thumbnail:hover {
      border-color: var(--color-primary);
    }
  `;
  
  return { html, styles };
};
