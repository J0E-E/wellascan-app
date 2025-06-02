const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.json')

module.exports = {
	preset: 'ts-jest/presets/js-with-babel',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	collectCoverage: true,
	collectCoverageFrom: ['**/*.{ts,tsx}', '!**/*.d.ts', '!**/node_modules/**', '!**/coverage/**', '!**/__tests__/**', '!**/app/**/_layout.tsx'],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'html', 'lcov'],
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
		prefix: '<rootDir>/',
	}),
	transform: {
		'^.+\\.(ts|tsx)$': 'babel-jest', // 👈 override to use Babel for JSX/TSX
	},
}
