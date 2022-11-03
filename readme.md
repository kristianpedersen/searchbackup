# TODO

- Ikke ha API-nøkler direkte i koden 🥲
- Flytte fra Kristians GitHub-repo til furst.no-repoet
- Overføre Algolia-prosjektet fra Kristians Gmail-adresse til alle med @furst.no-adresser
- Oppsettet er ganske Netlify-spesifikt. Er det lurt å få det over på Azure DevOps, eller blir det mer pes enn det er verdt?

Linker:

- https://app.netlify.com/sites/nffn/functions/sanity-algolia-webhook
- https://www.algolia.com/apps/C26QC41PWH/dashboard
- https://github.com/kristianpedersen/nffn

# Nytt furst.no-søk

Markedsavdelingen ønsker et bedre søk med flere tilpasningsmuligheter.

Foreløpig tester vi ut søketjenesten Algolia.

Denne mappa inneholder koden som sender dokumentendringer i CMS-et inn til Algolias søkeindeksering.

## Sanity

1. En artikkel opprettes/oppdateres/slettes

2. Webhook i Sanity kaller endepunkt som er hostet på Netlify

## Node-applikasjon --> Algolia

1. `handler`-funksjonen i `sanity-algolia-webhook.js` mottar et `event`-objekt.

2. `event.body.ids` inneholder både dokument-ID fra Sanity og implisitt hvilken handling som skal utføres:

```json
{
  "created": [null],
  "updated": ["dc168982-7559-4415-8c48-13b217ee4cf3"],
  "deleted": [null],
  "all": ["dc168982-7559-4415-8c48-13b217ee4cf3"]
}
```

```javascript
// Opprettelse og oppdatering av dokument:
await index.saveObject({
  ...fetchedDataFromSanity, // Hentes fra Sanitys API med ID-en ovenfor
  objectID: sanityDocumentID,
});

// Sletting av dokument
await index.deleteObject(sanityDocumentID);
```

# Installasjon og oppsett

- Netlify CLI: `npm install netlify-cli -g`
- Netlify serverless functions: https://www.netlify.com/blog/intro-to-serverless-functions/

Foreløpig er Netlify-prosjektet koblet opp mot Kristians GitHub-repo. Push til dette repoet trigger nytt bygg.

## Kristian har hatt litt trøbbel med Netlify

`netlify`-kommandoen fungerte ikke på WSL, så jeg måtte installere CLI-en som en devDependency.

For å kjøre kommandoen måtte jeg legge til `"netlify": "netlify"` i `scripts`-delen av `package.json` og skrive `npm run dev netlify ...`

Netlify påstår at loggen deres er "real-time", men det er bare humbug. Jeg måtte velge "Last hour" for å se hva som ble logget.

Ofte fungerte ting lokalt, men ikke i prod. For å kunne teste ting live måtte jeg commite, så commit-meldingene i GitHub-repoet er en skikkelig vederstyggelighet.

# Hvordan oppdatere hele indeksen hos Algolia hvis vi endrer struktur i Sanity-schemaene?

Mappen `updateAllAlgoliaEntries` inneholder et script som henter alle Sanity-dokumentene og oppdaterer dem i Algolia.

Hvis vi bestemmer oss for å endre på schemaene i Sanity, så slipper vi nå å lagre ett og ett dokument for å re-indeksere dem hos Algolia.

Naviger til `updateAllAlgoliaEntries` og kjør `node updateAllAlgoliaEntries.js`.
