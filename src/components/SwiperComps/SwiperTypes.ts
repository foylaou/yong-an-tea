import type { Swiper, SwiperOptions, AutoplayOptions, PaginationOptions } from 'swiper/types';

/**
 * Swiper 設定參數介面
 * 延伸 Swiper 官方設定（SwiperOptions），並額外支援使用自定義事件。
 *
 * @interface SwiperSettings
 * @extends SwiperOptions
 * @property {AutoplayOptions | boolean} [autoplay] 自動播放設定，可為物件或布林值
 * @property {PaginationOptions | boolean} [pagination] 分頁設定，可為物件或布林值
 * @property {(swiper: Swiper) => void} [onSlideChange] 幻燈片變更時的回呼
 * @property {() => void} [onSlideChangeTransitionStart] 幻燈片轉場開始事件
 * @property {(swiper: Swiper) => void} [onSlideChangeTransitionEnd] 幻燈片轉場結束事件
 */
export interface SwiperSettings extends Omit<SwiperOptions, 'autoplay' | 'pagination'> {
    autoplay?: AutoplayOptions | boolean;
    pagination?: PaginationOptions | boolean;
    onSlideChange?: (swiper: Swiper) => void;
    onSlideChangeTransitionStart?: () => void;
    onSlideChangeTransitionEnd?: (swiper: Swiper) => void;
}

