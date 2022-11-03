import algoliasearch from 'algoliasearch';
import fetch from 'node-fetch';
import { portableTextToPlainText } from '../netlify/functions/sanity-algolia-webhook/portableTextToPlainText.js';

const AlgoliaProjectID = 'C26QC41PWH';
const AlgoliaApiKey = 'e23b64dadd4c26f8678c15a2593521fa';
const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey);
const algoliaIndex = client.initIndex('searchResults');

const sanityQueryGetAllDocuments = `https://sukats6f.api.sanity.io/v2021-06-07/data/query/test?query=*[]{
  _id,
  address,
  articleLink,
  authors,
  content,
  email,
  extract,
  phonenumber,
  postAddress,
  publishedIn,
  slug,
  title,
  visitAddress,
}`;

async function updateAllEntries() {
  try {
    const allEntries = await fetch(sanityQueryGetAllDocuments);
    const allEntriesJSON = await allEntries.json();
    const entries = allEntriesJSON.result;

    entries.forEach(async function parseAndSend(sanityDocument) {
      const parsedSanityData = Object.entries(sanityDocument) // {a: 1, b: 2} --> [[a, 1], [b, 2]]
        .filter(([key, value]) => value !== null) // Maybe some additional filtering needs to be done here later on
        .map(function simplifyDataBeforeSubmitting([key, value]) {
          switch (key) {
            // Convert PortableText to plain text
            case 'content':
            case 'extract': {
              return {
                [key]: portableTextToPlainText(value),
              };
            }

            // Before: { _type: "slug", current: "furst-slug" }
            // After: { slug: "furst-slug" }
            case 'slug': {
              return {
                slug: value.current,
              };
            }

            // Algolia normally autogenerates an `objectID`, but we want to use the Sanity document ID instead
            case '_id': {
              return {
                objectID: value, // sanityDocument._id
              };
            }

            default: {
              return {
                [key]: value,
              };
            }
          }
        });

      // Prevent submission of empty object {}
      if (Object.keys(parsedSanityData).length === 0) {
        return;
      }

      try {
        const obj = Object.assign(...parsedSanityData); // Convert [{a: 1}, {b: 2}] to {a: 1, b: 2}
        await algoliaIndex.saveObject(obj);
      } catch (error) {
        console.error(error);
      }
    });
    console.log('Sånn! Nå har alle Algolia-dokumentene oppdatert struktur.');
  } catch (error) {
    console.error(error);
    console.error('Ikkje bra.');
  }
}

updateAllEntries();
