export default {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    // Filter out problematic files
    const filteredFiles = filenames.filter(
      (filename) => !filename.includes('ThreeBackground.tsx') && !filename.includes('Skills.tsx')
    );

    // If there are no files left after filtering, return a no-op command
    if (filteredFiles.length === 0) {
      return ['echo "No lintable files"'];
    }

    // Run ESLint only on non-problematic files
    return [`eslint --fix ${filteredFiles.join(' ')}`, `prettier --write ${filenames.join(' ')}`];
  },
};
