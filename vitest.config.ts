import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		include: ['src/**/*.test.ts']
	},
	resolve: {
		alias: {
			'@/v2': path.resolve(__dirname, 'src/v2')
		}
	}
})
