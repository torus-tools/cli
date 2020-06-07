<img src="https://github.com/arjan-tools/site/blob/master/img/arjan_localize_logo.svg" alt="Arjan Localize" width="200" style="max-width:100%;">

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://gkpty.mit-license.org)

# Arjan Localize

Arjan Localize is node module for automatically localizing and translating html sites. It features a powerful CLI command that allows you to localize multiple pages into multiple languages with a single command and export your content into popular formats like JSON and CSV.   

 ## What is Localization

Localization consists of adapting a product to a particular locality or region. Even though machine translation services like Google translate have gotten impressively good, there are still several scenarios were manual intervention is needed. If you are expanding your digital product/service into a new region its important to get everything perfect. Complex grammar rules and slang often cause errors in the translation making some manual intervention or at least revision necessary. Also a project that has been correctly localized will have way better SEO. Additionally text content might not be the only thing that you want to localize; you might also need to use different images/videos and hyperlinks in your different versions.

A common practice is to create JSON files called locales that contain the text content of site/app. Then instead of using words in your file, you use variables that read from the locale object. This way content modification dont have to be made directly in the code. In general, this makes your internationalized project easier to maintain.

## Automatic localization

Arjan uses the id attributes already present in your html as the keys in the locale. The parser in arjan localize gets all the existing IDs of html elements with text content, and saves them in the locale. If the element didnt have an ID arjan automatically creates an ID for the object with the following format:  The first 12 characters of the text, replacing spaces with underscores and adding the translation index at the end.

## Automatic translation

Arjan localize also helps you to automatically translate your JSON locales and files in up to 54 different languages. It uses AWS’s neural machine translation system which is used in amazon.com. 

## Usage

There’s three ways in which you can use arjan localize. The three are listed bellow with their pros and cons.


1. **Arjan CLI** 
    1. pros: 
        1. translate multiple pages
        2. bi-directional translation updates
    2. cons: No GUI. basic terminal usage knowledge
2. **The Arjan Localization GUI**
    1. Pros: 
        1. GUI
        2. No AWS account needed.
    2. cons: 
        1. only translate a single page at a time
        2. cannot update translations
3. **Programmatic usage**
    1. Pros: integrate into other programs and workflows
    2. Cons: requires setup for each project
    
## Arjan translate GUI

Arjan translate has a GUI at [arjan.tools/translate](http://arjan.tools/trans;ate.html). The GUI is a form with a dropzone made with [super easy forms](http://supereasyforms.com) which features a node.js lambda function as its backend. The GUI is pretty limited as you cant update your translations but its good for a one time job especially if you dont like using the terminal. 

## CLI
1. go into your sites directory `cd SITE_NAME`
2. run `arjan init SITE_NAME`  Refer to the provider setup section if you haven't used any of the cloud translation APIs.
3. Run the translate command `arjan translate SITE_NAME [FILENAME]`

## Updating content

The translate command generates 2 or 3 things

1. **locale JSON files** for the input and output languages
2. **translated html file/s** with the output language code (es.html or es/about.html)
3. **CSV** file with translations (optional)

Once you have translated your doc you can improve all of your translations by working directly on your neatly organized JSON locale files and running the translate command with the —update flag (-u).

Arjan translations is bi-directional meaning that you can also work on the output HTML files and then run the translate command with the —backwards (-b) flag to update your JSON files.

You can also generate a single CSV file with all the translations for your site by running the translate command with the —export flag (-e). if you use both the —export and —backwards flags you can update the CSV with site data. if you provide the filename arg only translations for that file will be included in the CSV.

## Output Path Generation

Translate locale considers that you can have 3 different routing formats for a multilingual HTML site. Lets take the following file for example: `blog/posts/post1.html`

1. **none**: You haven't structured your site to be multilingual. 
2. **file**: You are using the language code as the name of the file. for example `blog/posts/article1/en.html`
3. **dir:** You are using the language code as the name of the parent directory. i.e. `en/blog/posts/article1.html`


- In case 1, a directory named with the language code of your output language and the same file structure (excluding ignored directories and non-html files) will be created in the root of your project.
- In case 2, translated files will be saved with the name of the output language i.e. `blog/posts/article1/es.html`
- In Case 3, alike case 1, a directory with the name of the output language will be created in the root.
## Translation Format

The example compares arjan with i18n; Lets suppose our input is an en.html file with the following content: 

    <section>
      <h1 id="title1">Arjan is super cool</h1>
    </section>

After running the translate command we would get the following output:

1. locales/en.json → `{ "title1":"Arjan is super cool" }`
2. en.html 
    1. Arjan→ `<h1 id="title1"> Arjan is super cool </h1>`
    2. I18n → `<h1 id="title1"> {{arjan.t('title1)}} </h1>`

Lets suppose that our input string didnt have an id attribute:

1. locales/en.json → `{ "arjan_is_sup1":"Arjan is super cool" }`
2. en.html 
    1. Arjan → `<h1 id="arjan_is_sup1"> Arjan is super cool </h1>`
    2. en.html → `<h1> {{arjan.t('arjan_is_sup1')}} </h1>`

Notice that an id with the first 12 characters of the string is created. Caps are lower-cased and spaces are replaced with underscores. A number with the index of the translations is inserted at the end (in case there’s another string that starts with the same 12 chars)

For more information visit the [docs](https://arjan.tools/docs)
