// TODO: Mye duplisert kode i filene som oppdaterer ett dokument og alle dokumenter. Bør flyttes til egen fil.

// import algoliasearch from 'algoliasearch';
import fetch from 'node-fetch';
import { portableTextToPlainText } from '../../algolia-utils/portableTextToPlainText';

export async function get({ params }) {
  const AlgoliaProjectID = 'C26QC41PWH';
  const AlgoliaApiKey = 'e23b64dadd4c26f8678c15a2593521fa'; // TODO: Legg et annet sted :)
  const client = algoliasearch(AlgoliaProjectID, AlgoliaApiKey);

  const sanityProjectID = 'sukats6f';
  const index = client.initIndex('searchResults');

  try {
    // These are all either [null] or [sanityDocumentID]
    const { created, deleted, updated, all } = JSON.parse(event.body).ids; // TODO: Endre fra event.body til noe med params.blabla
    const sanityDocumentID = all[0];

    if (deleted[0]) {
      await index.deleteObject(sanityDocumentID);
    } else if (updated[0] || created[0]) {
      const projection = `{
        content,
        slug,
        title,
      }`;
      const sanityURL = `https://${sanityProjectID}.api.sanity.io/v2021-06-07/data/query/test?query=*[_id=="${sanityDocumentID}"]${projection}`;
      const response = await fetch(sanityURL);
      const json = await response.json();

      let { content, slug, title } = json?.result[0];
      content = portableTextToPlainText(content);

      await index.saveObject({
        content,
        slug: slug.current,
        title,
        objectID: sanityDocumentID,
      });
    }
    return new Response(JSON.stringify(params), {
      status: 200,
    });
  } catch (error) {
    return new Response('Ikkje bra: ' + JSON.stringify(params), {
      status: 500,
    });
  }
}
