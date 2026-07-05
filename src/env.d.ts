/// <reference types="astro/client" />

type Locale = "en" | "es" | "ca";

declare namespace App {
    interface Locals {
        locale: Locale;
    }
}
