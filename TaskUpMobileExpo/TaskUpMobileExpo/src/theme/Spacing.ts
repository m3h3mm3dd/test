/**
 * Consistent spacing system for layout, padding, margin, and gap
 */
const Spacing = {
  // Base spacing units (multiples of 4)
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,

  // Semantic spacing aliases for better readability
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,

  // Layout specific
  screenPadding: 16,
  screenPaddingLarge: 24,
  containerMargin: 16,
  sectionSpacing: 32,
  cardPadding: 16,
  listItemPadding: 16,
  itemSpacing: 16,
  inlineSpacing: 8,
  buttonPadding: {
    sm: { x: 12, y: 6 },
    md: { x: 16, y: 10 },
    lg: { x: 20, y: 12 },
  },
  
  // Form elements
  inputPadding: 12,
  inputSpacing: 20,
  formGroupSpacing: 24,
  labelSpacing: 8,
  helpTextSpacing: 4,
  
  // Component spacing
  avatarGap: -8,  // Negative value for overlapping avatars
  modalPadding: 16,
  toastPadding: 16,
  
  // Tab & navigation
  tabBarPadding: 16,
  tabItemPadding: 12,
  navBarHeight: 56,
  bottomNavHeight: 64,
  
  // Grid system
  gridGap: 16,
  gridGapLarge: 24,
  
  // Z-index levels
  zIndex: {
    base: 0,
    content: 10,
    overlay: 20,
    dropdown: 30,
    modal: 40,
    toast: 50,
  },
};

export default Spacing;