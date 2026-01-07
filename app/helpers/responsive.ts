import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Tỷ lệ chuẩn thiết kế (ví dụ bạn thiết kế trên iPhone 14: 390x844)
const designWidth = 390;
const designHeight = 844;

export const wp = (widthPercent: number) => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * widthPercent) / 100);
};

export const hp = (heightPercent: number) => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * heightPercent) / 100);
};

// Hàm scale theo kích thước màn hình để font chữ không quá to/nhỏ
export const scale = (size: number) => (SCREEN_WIDTH / designWidth) * size;