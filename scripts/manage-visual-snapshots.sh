#!/bin/bash

# Script to run visual regression tests AND/OR update visual snapshots

# Help text
show_help() {
  echo "Manage Visual Snapshots - Run tests or update baseline snapshots"
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -u, --update           Update snapshots instead of comparing (use this to create baselines)"
  echo "  -t, --test             Specific test file to run (e.g. 'visual-regression', 'threejs-background')"
  echo "  -a, --all              Run all visual and ThreeJS tests (including unstable ones)"
  echo "  -d, --dynamic          Run only dynamic/unstable tests"
  echo "  -h, --help             Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                       # Run just stable visual tests (excludes dynamic content tests)"
  echo "  $0 -u                    # UPDATE stable visual test snapshots (creates new baseline)"
  echo "  $0 -a                    # Run all visual tests including dynamic/unstable content"
  echo "  $0 -d                    # Run only tests with dynamic/unstable content"
  echo "  $0 -u -d                 # Update snapshots for dynamic content tests"
  echo "  $0 -t threejs-background # Run only ThreeJS background tests"
}

# Default values
UPDATE_SNAPSHOTS=false
TEST_FILE="visual-regression"  # Default to visual-regression test
RUN_ALL=false
DYNAMIC_ONLY=false
GREP_PATTERN=""
GREP_INVERT_PATTERN="@unstable-rendering"  # Exclude unstable tests by default

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -u|--update)
      UPDATE_SNAPSHOTS=true
      shift
      ;;
    -t|--test)
      TEST_FILE="$2"
      shift
      shift
      ;;
    -a|--all)
      RUN_ALL=true
      GREP_INVERT_PATTERN=""  # Don't exclude anything
      shift
      ;;
    -d|--dynamic)
      DYNAMIC_ONLY=true
      GREP_PATTERN="@unstable-rendering"  # Only run unstable tests
      GREP_INVERT_PATTERN=""  # Don't exclude anything
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Build test arguments
if [ -n "$TEST_FILE" ]; then
  # If a specific test file was requested
  TEST_ARGS="tests/$TEST_FILE.spec.ts"
else
  # Otherwise set it to an empty string to run all visual tests
  TEST_ARGS=""
fi

# Add grep pattern if specified
if [ -n "$GREP_PATTERN" ]; then
  TEST_ARGS="$TEST_ARGS --grep \"$GREP_PATTERN\""
fi

# Add grep-invert pattern if specified
if [ -n "$GREP_INVERT_PATTERN" ]; then
  TEST_ARGS="$TEST_ARGS --grep-invert \"$GREP_INVERT_PATTERN\""
fi

# Check if snapshots should be updated
if [ "$UPDATE_SNAPSHOTS" = true ]; then
  TEST_ARGS="$TEST_ARGS --update-snapshots"
fi

# Add project (only use Chromium for snapshots to keep them consistent)
TEST_ARGS="$TEST_ARGS --project=chromium"

# Final command
CMD="npx playwright test $TEST_ARGS"

# Run the command
echo "Running: $CMD"
eval $CMD

# Show report if tests ran
if [ $? -ne 0 ]; then
  echo "Tests failed. Check the report for details."
  npx playwright show-report
else
  echo "Tests completed successfully!"
fi 