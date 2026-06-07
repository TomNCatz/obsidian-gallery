import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import autoPreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import copy from 'rollup-plugin-copy';
import { env } from "process";

export default {
    input: "src/main.ts",
    output: {
        format: "cjs",
        file: "main.js",
        exports: "default",
    },
    external: ["obsidian", "fs", "os", "path"],
    plugins: [
        svelte({
            emitCss: false,
            preprocess: autoPreprocess(),
        }),
        typescript({ sourceMap: env.env === "DEV" }),
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
        commonjs({
            include: "node_modules/**",
        }),
        copy({
            targets: [
                { src: 'static/g', dest: 'public' },
                { src: './main.js', dest: '../PluginDev/.obsidian/plugins/tagged-gallery' },
                { src: './manifest.json', dest: '../PluginDev/.obsidian/plugins/tagged-gallery' },
                { src: './styles.css', dest: '../PluginDev/.obsidian/plugins/tagged-gallery' }
            ],
            hook: 'writeBundle'
        })
    ]
};