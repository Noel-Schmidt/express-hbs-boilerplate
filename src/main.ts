import { EnvironmentLoader, ProcessEnvironment } from "@mscs/environment";
import { join } from "path";
import { defaultRouter } from "./router";

import * as express from "express";
import * as hbs from "express-handlebars"
import * as helpers from "handlebars-helpers"

const ENVIRONMENT = new ProcessEnvironment();

async function bootstrap() {
    const environmentLoader = new EnvironmentLoader(ENVIRONMENT);
    await environmentLoader.loadEnvironment(join(__dirname + "/../.env"));

    const APP_MODE: string = ENVIRONMENT.has("APP_MODE") ? ENVIRONMENT.get("APP_MODE") : "development";
    const APP_HOST: string = ENVIRONMENT.has("APP_HOST") ? ENVIRONMENT.get("APP_HOST") : "127.0.0.1";
    const APP_PORT: number = ENVIRONMENT.has("APP_PORT") ? parseInt(ENVIRONMENT.get("APP_PORT"), 10) : 4200;

    ENVIRONMENT.set("APP_MODE", APP_MODE.toString());
    ENVIRONMENT.set("APP_HOST", APP_HOST.toString());
    ENVIRONMENT.set("APP_PORT", APP_PORT.toString());

    return { APP_MODE: APP_MODE, APP_HOST: APP_HOST, APP_PORT: APP_PORT }
}

async function app(config) {
    const application = express();

    application.set("views", join(__dirname, "Views"));
    application.set("view engine", "hbs");
    application.engine("hbs", hbs({
        layoutsDir: join(__dirname + "/Views/components/layouts"),
        defaultLayout: join(__dirname + "/Views/components/layouts/default.hbs"),
        partialsDir: join(__dirname + "/Views/components/partials"),
        extname: ".hbs",
        helpers: helpers()
    }));

    application.use("/dist", express.static(__dirname + "/Views/assets"));

    application.use("/", defaultRouter);

    if(config.APP_MODE == "production") {
        application.set("trust proxy", 1);
    }

    await application.listen(config.APP_PORT, config.APP_PORT, () => {
        console.log('\nAPP is running at http://%s:%s in %s mode', config.APP_HOST, config.APP_PORT, config.APP_MODE)
        console.log('Press CTRL-C to stop\n');
    })
}

bootstrap()
.then(app)
.catch(error => {
    console.log(error);
    process.exit(1);
})
