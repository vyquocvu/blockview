
export const hexToDecimal = (hexStr: string): string => {
  if (!hexStr || hexStr === '0x') return '0';
  try {
    // Remove '0x' prefix if present
    const cleanHex = hexStr.startsWith('0x') ? hexStr.slice(2) : hexStr;
    return BigInt('0x' + cleanHex).toString(10);
  } catch (error) {
    console.error('Error converting hex to decimal:', error);
    return hexStr; // Return original if conversion fails
  }
};

// Function to format address for display (shortened form)
export function formatAddress(address: string) {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
