# Visual Regression Testing

This project includes comprehensive visual regression testing to ensure UI consistency between changes. The tests capture snapshots of different UI elements and pages in both light and dark themes and compare them to baseline images.

## Test Structure

The tests are divided into two categories:

1. **Stable Visual Tests**: Tests for UI elements without animations or dynamic content
2. **Dynamic Content Tests**: Tests for UI elements with ThreeJS animations or dynamic content

The distinction allows us to run stable tests automatically in CI/pre-push hooks without random failures due to animation variations.

## Running Visual Tests

### Stable Visual Tests

```bash
# Run stable visual tests (excluding ThreeJS animations)
npm run snapshots
```

### Dynamic Content Tests

```bash
# Run tests with dynamic/ThreeJS content
npm run snapshots:dynamic
```

### All Visual Tests

```bash
# Run all visual tests (both stable and dynamic)
npm run snapshots:all
```

## Updating Snapshots

When you make intentional UI changes, you'll need to update the baseline snapshots:

```bash
# Update stable visual test snapshots
npm run snapshots:update

# Update dynamic content test snapshots
npm run snapshots:update-dynamic

# Update all snapshots
npm run snapshots:update-all
```

## Running Specific Tests

You can run tests for specific components:

```bash
# Run ThreeJS background tests
npm run snapshots:threejs

# Update ThreeJS snapshots
npm run snapshots:update-threejs
```

## How Tests Are Tagged

The dynamic/ThreeJS tests are tagged with `@unstable-rendering` in the test file. This tag is used to filter tests when running different commands.

## Pre-Push Hook

The pre-push hook automatically runs the stable visual regression tests. This ensures that your UI remains consistent without being affected by random variations in ThreeJS animations.

## Handling Differences

Visual tests allow for small pixel differences by setting these parameters:

```typescript
await expect(screenshot).toMatchSnapshot('example.png', {
  maxDiffPixelRatio: 0.05, // Allow up to 5% of pixels to be different
  threshold: 0.2           // Pixel color difference threshold
});
```

Different UI elements have different thresholds based on their likelihood of having visual variations:

- Header elements: 5% pixel difference, 0.2 threshold
- Main content (potential animation): 20% pixel difference, 0.3 threshold
- ThreeJS elements: 30% pixel difference, 0.5 threshold 