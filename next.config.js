/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ["@libsql/client"],
	},
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.externals.push("@libsql/client");
		}
		return config;
	},
};

export default nextConfig;
