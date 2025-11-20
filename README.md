# Nested Object Edge Cases and Handling Mechanisms

This document describes the specific edge cases related to nested object property access and the mechanisms implemented to handle them in the utility functions.

## Edge Case 1: Path is Empty / Invalid

### Problem:

- User pass "", ".", "..", "a..b", non-strings, or paths made of whitespace.

### What I do:

- Check that the path is a non-empty string
- Reject `.`, `..`, or any path containing `..`
- Trim whitespace and revalidate
- Split into keys using ., then drop any empty segments
- If the path is still invalid, getNestedObjectValue returns undefined and setNestedObjectValue simply exits

## Edge Case 2: Intermediate Key is Not an Object

### Problem

- When traversing a path, an intermediate property is not an object (e.g., `null`, `undefined`, primitive values)
- Attempting to access properties on non-object values would cause runtime errors

### What I do :

- During get, if a non-object is encountered mid-path, the function stops and returns undefined
- During set, if the path needs to continue but the current segment isn’t an object, it gets replaced with a new empty object so we can continue safely
- Missing properties along the way are created as empty objects

## Edge Case 3: Object Itself is Null/Undefined

### Problem

- Attempting to access properties on `null` or `undefined` would cause runtime errors

### What I do :

- getNestedObjectValue checks the root object at the beginning
  - If it’s null or undefined, return undefined immediately
- setNestedObjectValue does the same and exits early

## Implementation Details

### getNestedObjectValue Function

- Accepts obj as an object, null, or undefined
- PValidates the path before accessing
- Walks the object safely
- Returns `undefined` for any invalid conditions or missing values

### setNestedObjectValue Function

- Uses the same path validations
- Creates missing intermediate objects
- Converts existing non-object values mid-path when needed
- Sets the final value without breaking
- Doesn’t set anything if the path itself is invalid
