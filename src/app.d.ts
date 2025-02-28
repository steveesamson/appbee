// See https://svelte.dev/docs/kit/types#app.d.ts

declare global {

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production';
		}
	}
}


export { };
