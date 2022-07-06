import { FluentBundle, FluentResource, FluentVariable } from "@fluent/bundle";
import { negotiateLanguages } from "@fluent/langneg";
import { readdirSync, readFileSync } from "fs";
import { basename, resolve } from "path";
import { Ctx } from "./commands";
import { log } from "./main";

const DEFAULT_LOCALE = "en";

class L10n {
    private langs: string[] = [];
    private bundles: Map<string, FluentBundle> = new Map();

    public constructor() {
        this.init();
    }

    public t<K extends any>(ctx: Ctx, id: string, l10nCtx?: Record<string, FluentVariable>): K | any {
        const supportedLocales = negotiateLanguages(
            [ctx.locale], // requested locales
            this.langs, // available locales
            { defaultLocale: DEFAULT_LOCALE }
        );

        const locale = supportedLocales[0];

        if (this.bundles.has(locale)) {
            const bundle = this.bundles.get(locale) as FluentBundle;

            const l = bundle.getMessage(id);

            if (l && l.value) {
                bundle.formatPattern(l.value, l10nCtx);
            } else {
                return id;
            }
        } else {
            log.error(`Tried getting ${id} from ${locale}.`);
            return id;
        }
    }

    public async init() {
        log.info(`Loading locales...`);

        const l10nDir = resolve(process.cwd(), "l10n");

        for await (const locale of readdirSync(l10nDir)) {
            const lang = locale.split(".")[0];

            log.info(`Loading ${lang} locale...`);
            this.langs.push(lang);

            const resource = new FluentResource(readFileSync(resolve(l10nDir, locale), "utf-8"));
            const bundle = new FluentBundle(lang);

            const errors = bundle.addResource(resource);

            if (errors.length) {
                log.error(`Error loading ${lang} locale!`);

                for (const err in errors) {
                    log.error(err);
                }

                return;
            }

            this.bundles.set(lang, bundle);
        }
    }
}

export default L10n;