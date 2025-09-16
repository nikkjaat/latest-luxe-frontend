// Utility functions for color handling

export const generateColorVariations = (baseColor) => {
  // Generate common color variations for a base color
  const variations = {
    red: ["#DC2626", "#EF4444", "#F87171", "#FCA5A5"],
    blue: ["#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD"],
    green: ["#059669", "#10B981", "#34D399", "#6EE7B7"],
    purple: ["#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD"],
    yellow: ["#D97706", "#F59E0B", "#FBBF24", "#FCD34D"],
    pink: ["#DB2777", "#EC4899", "#F472B6", "#F9A8D4"],
    gray: ["#374151", "#6B7280", "#9CA3AF", "#D1D5DB"],
    black: ["#000000", "#1F2937", "#374151", "#4B5563"],
    white: ["#FFFFFF", "#F9FAFB", "#F3F4F6", "#E5E7EB"],
  };

  const colorName = baseColor.toLowerCase();
  return variations[colorName] || [baseColor];
};

export const getColorName = (hexCode) => {
  // Convert hex code to approximate color name
  const colorMap = {
    "#000000": "Black",
    "#FFFFFF": "White",
    "#FF0000": "Red",
    "#00FF00": "Green",
    "#0000FF": "Blue",
    "#FFFF00": "Yellow",
    "#FF00FF": "Magenta",
    "#00FFFF": "Cyan",
    "#FFA500": "Orange",
    "#800080": "Purple",
    "#FFC0CB": "Pink",
    "#A52A2A": "Brown",
    "#808080": "Gray",
    "#C0C0C0": "Silver",
    "#FFD700": "Gold",
  };

  return colorMap[hexCode.toUpperCase()] || "Custom Color";
};

export const isLightColor = (hexCode) => {
  // Determine if a color is light (for text contrast)
  const hex = hexCode.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

export const getContrastColor = (hexCode) => {
  // Get contrasting color for text
  return isLightColor(hexCode) ? "#000000" : "#FFFFFF";
};

export const validateColorCode = (hexCode) => {
  // Validate hex color code format
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(hexCode);
};

export const formatColorForDisplay = (colorVariant) => {
  // Format color variant for display
  return {
    name: colorVariant.colorName || getColorName(colorVariant.colorCode),
    code: colorVariant.colorCode,
    stock: colorVariant.stock || 0,
    priceAdjustment: colorVariant.priceAdjustment || 0,
    images: colorVariant.images || [],
  };
};

export const getAvailableColors = (colorVariants) => {
  // Get only colors that are in stock
  return colorVariants.filter((variant) => variant.stock > 0);
};

export const getTotalStock = (colorVariants) => {
  // Calculate total stock across all color variants
  return colorVariants.reduce(
    (total, variant) => total + (variant.stock || 0),
    0
  );
};

export const getLowestPrice = (basePrice, colorVariants) => {
  // Get the lowest price including color adjustments
  const basePriceNum = parseFloat(basePrice);
  const lowestAdjustment = Math.min(
    ...colorVariants.map((v) => parseFloat(v.priceAdjustment || 0))
  );
  return basePriceNum + lowestAdjustment;
};

export const getHighestPrice = (basePrice, colorVariants) => {
  // Get the highest price including color adjustments
  const basePriceNum = parseFloat(basePrice);
  const highestAdjustment = Math.max(
    ...colorVariants.map((v) => parseFloat(v.priceAdjustment || 0))
  );
  return basePriceNum + highestAdjustment;
};
