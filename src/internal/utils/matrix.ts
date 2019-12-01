import { Vertices } from '../types';

/**
 * Create an nxn identity matrix.
 *
 * @param matrix Matrix
 * @returns true if is square matrix
 */
function isSquareMatrix(matrix: number[][]) {
  return matrix.every((row) => row.length === matrix.length);
}

/**
 * Create an nxn identity matrix.
 *
 * @param diagonal Length of matrix
 * @returns Identity matrix
 */
function createIdentityMatrix(diagonal: number) {
  const matrix: number[][] = [];
  for (let i = 0; i < diagonal; i += 1) {
    matrix[i] = [];
    for (let j = 0; j < diagonal; j += 1) {
      matrix[i][j] = j === i ? 1 : 0;
    }
  }
  return matrix;
}

/**
 * Swap matrix rows
 *
 * @param matrix Matrix
 * @param from From
 * @param to To
 * @returns New matrix
 */
function swap(matrix: number[][], from: number, to: number) {
  if (matrix[from] && matrix[to]) {
    return matrix.map((row, index) => {
      switch (index) {
        case from:
          return matrix[to];
        case to:
          return matrix[from];
        default:
          return row;
      }
    });
  }
  return matrix;
}

/**
 * Perform addition to a Matrix
 *
 * @param matrix Matrix
 * @param from From
 * @param to To
 * @param factor Factor
 * @returns New matrix
 */
function add(matrix: number[][], from: number, to: number, factor: number) {
  return matrix.map((row, rowIndex) =>
    rowIndex === to
      ? row.map(
          (value, index) => matrix[to][index] + matrix[from][index] * factor
        )
      : row
  );
}

/**
 * Divide a target row of a matrix
 *
 * @param matrix Matrix
 * @param targetRow Target row
 * @param divider Divider
 * @returns New matrix
 */
function divide(matrix: number[][], targetRow: number, divider: number) {
  return matrix.map((row, rowIndex) =>
    rowIndex === targetRow ? row.map((value) => (value /= divider)) : row
  );
}

/**
 * Invert rows and columns of a matrix
 *
 * @param matrix Matrix
 * @returns Transposed matrix
 */
function transpose(matrix: number[][]) {
  const tMatrix: number[][] = [];
  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = 0; j < matrix[i].length; j += 1) {
      tMatrix[j] = !tMatrix[j] ? [matrix[i][j]] : [...tMatrix[j], matrix[i][j]];
    }
  }
  return tMatrix;
}

/**
 * Multiply two matrix
 *
 * @param matrixA Matrix
 * @param matrixB Matrix
 * @returns Result of multiplication
 */
function multiply(matrixA: number[][], matrixB: number[][]) {
  return !matrixA.every((row) => row.length === matrixB[0].length)
    ? matrixB
    : matrixB.map((col) =>
        matrixA.map((row) =>
          row.reduce((acc, value, index) => col[index] * value + acc, 0)
        )
      );
}

/**
 * Gauss-Jordan Elimination
 *
 * @param matrixA Matrix A
 * @param matrixB Matrix B
 *
 * @returns New Matrix
 */
// prettier-ignore
function gj(matrixA: number[][], matrixB: number[][]) {

  for (let rowIndex = 0; rowIndex < matrixA.length; rowIndex += 1) {
    if (matrixA[rowIndex][rowIndex] === 0) {
      for (let i = rowIndex + 1; i < matrixA.length; i += 1) {
        if (matrixA[i][rowIndex]) {
          matrixA = swap(matrixA, rowIndex, i);
          matrixB = swap(matrixB, rowIndex, i);
          break;
        }
      }
    }

    if (matrixA[rowIndex][rowIndex]) {
      const divider = matrixA[rowIndex][rowIndex];
      matrixA = divide(matrixA, rowIndex, divider);
      matrixB = divide(matrixB, rowIndex,  divider);
    } else {
      return [];
    }
    /**
     * Suppose we are working on the 1st row.
     * At this point the identityIndex value should be 1. So we are able to transform the matrix as follows
     *
     * [                [
     *  [1, 0, 0]         [1, 0, 0]
     *  [2, 2, 0]     ->  [0, 2, 0]
     *  [9, 1, 1]         [0, 1, 1]
     * ]                ]
     *
     **/
    for (let rowIndex2 = 0; rowIndex2 < matrixA.length; rowIndex2 += 1) {
      if (matrixA[rowIndex2][rowIndex] === 0 || rowIndex === rowIndex2) {
        continue;
      }
      const factor = -matrixA[rowIndex2][rowIndex];
      matrixA = add(matrixA, rowIndex, rowIndex2, factor);
      matrixB = add(matrixB, rowIndex, rowIndex2, factor);
    }
  }

  return matrixB;
}

/**
 * Invert a square matrix.
 * https://www.intmath.com/matrices-determinants/inverse-matrix-gauss-jordan-elimination.php
 *
 * @param matrix Matrix
 * @returns Identity matrix
 */
function invert(
  matrix: number[][],
  inverseMatrix: number[][] = createIdentityMatrix(matrix.length)
) {
  return isSquareMatrix(matrix) ? gj(matrix, inverseMatrix) : [];
}

/**
 * Solve a system of equations of the form Ah = b.
 * Where A, b, h are matrices
 *
 * @param matrixA Matrix A
 * @param matrixB Matrix b
 *
 * @returns Matrix h
 */
function solve(matrixA: number[][], matrixB: number[][]) {
  const inverseMatrix = invert(matrixA);
  return inverseMatrix.length === 0 ? [[]] : multiply(inverseMatrix, matrixB);
}

export function create3DMatrix(from: Vertices, to: Vertices) {
  const [x0, y0] = from[0];
  const [x1, y1] = from[1];
  const [x2, y2] = from[2];
  const [x3, y3] = from[3];

  const [u0, v0] = to[0];
  const [u1, v1] = to[1];
  const [u2, v2] = to[2];
  const [u3, v3] = to[3];

  // https://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
  // prettier-ignore
  const A = [
   [ x0, y0, 1, 0, 0, 0, -u0 * x0, -u0 * y0],
   [ 0, 0, 0, x0, y0, 1, -v0 * x0, -v0 * y0],
   [ x1, y1, 1, 0, 0, 0, -u1 * x1, -u1 * y1],
   [ 0, 0, 0, x1, y1, 1, -v1 * x1, -v1 * y1],
   [ x2, y2, 1, 0, 0, 0, -u2 * x2, -u2 * y2],
   [ 0, 0, 0, x2, y2, 1, -v2 * x2, -v2 * y2],
   [ x3, y3, 1, 0, 0, 0, -u3 * x3, -u3 * y3],
   [ 0, 0, 0, x3, y3, 1, -v3 * x3, -v3 * y3]
  ];
  const b = [[u0, v0, u1, v1, u2, v2, u3, v3]];
  const [h] = solve(A, b);

  // prettier-ignore
  return h.length === 0
    ? []
    : transpose([
       [h[0], h[1], 0, h[2]],
       [h[3], h[4], 0, h[5]],
       [   0,    0, 1,    0],
       [h[6], h[7], 0,    1]
      ]);
}
