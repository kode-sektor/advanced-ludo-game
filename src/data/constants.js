export const TURNING_POINTS = [0, 4, 10, 12, 17, 23, 25, 30, 36, 38, 43, 49, 50];
export const DIAGONALS = [4, 17, 30, 43];
export const CELL_SPEED = 0.2;
const northward = [
		...[...Array(4)].map((_, i) => 0 + i),
		...[...Array(12 - 10)].map((_, i) => 10 + i),
		...[...Array(23 - 18)].map((_, i) => 18 + i),
		...[...Array(55 - 50)].map((_, i) => 50 + i)
	];	// (16) [0, 1, 2, 3, 10, 11, 18, 19, 20, 21, 22...]
	
const southward = [
		...[...Array(30 - 25)].map((_, i) => 25 + i),
		...[...Array(38 - 36)].map((_, i) => 36 + i),
		...[...Array(49 - 44)].map((_, i) => 44 + i)
	];	// (12) [25, 26, 27, 28, 29, 36, 37, 45, 46,...]
const eastward = [
		...[...Array(17 - 12)].map((_, i) => 12 + i),
		...[...Array(25 - 23)].map((_, i) => 23 + i),
		...[...Array(36 - 31)].map((_, i) => 31 + i)
	];
const westward = [
		...[...Array(10 - 5)].map((_, i) => 5 + i),
		...[...Array(43 - 38)].map((_, i) => 38 + i),
		...[...Array(50 - 49)].map((_, i) => 49 + i)
	];
export const CARDINAL_POINTS = {
	north: northward,
	south: southward,
	east: eastward,
	west: westward,
};

