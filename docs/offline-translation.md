# Offline Translation

The active site locales and native-language labels are configured in `src/lib/i18n/languages.json`. The selector includes English, Bengali, Hindi, Marathi, and Urdu. Marathi remains selectable because its UI dictionary and recipe translations already exist. Argos currently has direct English models for Bengali, Hindi, and Urdu only; `translationTargets` keeps the Argos CLI limited to those languages. Missing UI values and recipe translations fall back to English.

## Install locally

Create a Python virtual environment and install the dependencies:

```sh
python3 -m venv .venv
```

Activate it using the command for your shell. Activation scripts are sourced, not executed:

```sh
# fish
source .venv/bin/activate.fish

# bash or zsh
source .venv/bin/activate

# POSIX sh
. .venv/bin/activate
```

Then install the dependencies:

```sh
python -m pip install -r scripts/requirements-translate.txt
```

If the environment was created as `venv` rather than `.venv`, replace `.venv` with `venv` in the activation path.

Install Argos language packages for English to each target. A direct `en -> target` package is preferred; otherwise install a complete pivot path, such as `en -> intermediate -> target`. The CLI detects installed routes, reports the exact path it will use, and never downloads models. Use the Argos Translate application or its documented package manager to install packages locally.

## Run

From the repository root, this single command processes every configured Argos target for both UI and recipe text:

```sh
python scripts/translate.py
```

It uses installed Argos model routes and reports any configured languages without a direct or pivot route. It does not install models automatically.

To explicitly download and install every direct English-to-target model available in the Argos package index, then translate all supported configured languages, run:

```sh
python scripts/translate.py --install-models
```

This requires internet access and downloads model files. It only installs direct English-to-target packages; targets without packages are reported and skipped. Argos's current package index includes direct English models for Bengali (`bn`), Hindi (`hi`), and Urdu (`ur`), but not most of the other scheduled Indian languages. Marathi remains a supported site locale through its existing translations, but Argos cannot generate new Marathi translations. Installing every Argos model with `argospm install translate` is not recommended here because it downloads a much larger global model set.

For a selected subset or content type:

```sh
python scripts/translate.py --languages bn ur
python scripts/translate.py --languages ur --type ui
python scripts/translate.py --languages bn --type recipes
python scripts/translate.py --list-models
```

Existing non-empty translations are preserved. Add `--overwrite` to regenerate them. UI translation changes string values only; dictionary keys and non-string JSON values are retained, and placeholders, HTML tags, Markdown links, inline code, and printf tokens are protected. Recipe translation reads only title, description, instructions, and text inside configured `:::lang` blocks; recipe quantities, units, nutrition, and other metadata remain outside the blocks.

Review machine-generated translations before publishing, especially nutrition and allergen language. The script skips unavailable language paths and exits with status 2 while listing the missing routes.