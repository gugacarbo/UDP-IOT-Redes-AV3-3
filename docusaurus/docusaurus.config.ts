import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
	title: "UDP IoT Monitor",
	tagline: "Sistema de Monitoramento IoT via UDP — Matriz e Filiais ESP32",
	favicon: "img/favicon.ico",

	future: {
		v4: true,
	},

	url: "https://gugacarbo.github.io",
	baseUrl: "/UDP-IOT-Redes-AV3-3/",

	organizationName: "gugacarbo",
	projectName: "UDP-IOT-Redes-AV3-3",

	onBrokenLinks: "throw",

	i18n: {
		defaultLocale: "pt-BR",
		locales: ["pt-BR"],
	},

	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
					editUrl:
						"https://github.com/gugacarbo/UDP-IOT-Redes-AV3-3/tree/main/docs/",
				},
				theme: {
					customCss: "./src/css/custom.css",
				},
			} satisfies Preset.Options,
		],
	],

	markdown: {
		mermaid: true,
	},

	themes: ["@docusaurus/theme-mermaid"],

	themeConfig: {
		image: "img/docusaurus-social-card.jpg",
		colorMode: {
			respectPrefersColorScheme: true,
		},
		navbar: {
			title: "UDP IoT Monitor",
			logo: {
				alt: "UDP IoT Logo",
				src: "img/logo.svg",
			},
			items: [
				{
					type: "docSidebar",
					sidebarId: "docsSidebar",
					position: "left",
					label: "Documentação",
				},
				{
					href: "https://github.com/gugacarbo/UDP-IOT-Redes-AV3-3",
					label: "GitHub",
					position: "right",
				},
			],
		},
		footer: {
			style: "dark",
			links: [
				{
					title: "Documentação",
					items: [
						{
							label: "Introdução",
							to: "/docs",
						},
						{
							label: "Arquitetura",
							to: "/docs/category/arquitetura",
						},
						{
							label: "Protocolo",
							to: "/docs/category/protocolo",
						},
					],
				},
				{
					title: "Firmware",
					items: [
						{
							label: "Matriz ESP32",
							to: "/docs/firmware/matriz/overview",
						},
						{
							label: "Filial ESP32",
							to: "/docs/firmware/filial/overview",
						},
					],
				},
				{
					title: "Mais",
					items: [
						{
							label: "GitHub",
							href: "https://github.com/gugacarbo/UDP-IOT-Redes-AV3-3",
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} UDP IoT Monitor — Projeto AV3 Redes.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
			additionalLanguages: ["json", "bash", "cpp"],
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
