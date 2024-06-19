// utils.js
export function formatStrainName(strain_name) {
    return strain_name
      .trim() // Remove leading and trailing whitespaces
      .replace(/\s+/g, '-') // Replace whitespace with dash
      .replace(/[^\w-]+/g, '') // Remove all other special characters
      .toLowerCase();
  }
  