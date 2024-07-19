import xml2js from 'xml2js';
import { JSDOM } from 'jsdom';
import { z } from 'zod';
import { Episode } from '..';

const xmlParser = xml2js.parseString;

export const getPodcastEpisodes = async (podcastUrl: string, pageNumber: number) => {

  const numberOfResultsPerPage = 10;
  const response = await fetch(podcastUrl);
  const xml = await response.text();

  return new Promise<{
    totalPages: number;
    totalItems: number;
    currentPage: number;
    episodes: z.infer<typeof Episode>[];
  }>((resolve, reject) => {
    return xmlParser(xml, (err, result) => {
      if (err) {
        return reject(err);
      }
      const showArt = result.rss.channel[0].image[0].url[0];
      const allEpisodes = result.rss.channel[0].item;

      const episodes = allEpisodes.slice((pageNumber - 1) * numberOfResultsPerPage, pageNumber * numberOfResultsPerPage);

      console.log({
        start: (pageNumber - 1) * numberOfResultsPerPage,
        end: pageNumber * numberOfResultsPerPage
      })

      return resolve({
        totalPages: Math.ceil(allEpisodes.length / numberOfResultsPerPage),
        totalItems: allEpisodes.length,
        currentPage: pageNumber,
        episodes: episodes.map((item: any) => {

          const descriptionDom = new JSDOM(`<!DOCTYPE html><body>${item.description ? item.description[0] : ''}</body>`);
          const description = descriptionDom.window.document.body.textContent;
          const episodeArt = item["itunes:image"] ? item["itunes:image"][0].$.href : showArt;

          const guid = item.guid ? item.guid[0] : '';

          return {
            title: item.title ? item.title[0] : '',
            description: description?.substring(0, 256),
            audioUrl: item.enclosure && item.enclosure[0] && item.enclosure[0].$ ? item.enclosure[0].$.url : '',
            publishedAt: item.pubDate ? item.pubDate[0] : '',
            duration: item["itunes:duration"] ? item["itunes:duration"][0] : '',
            episodeArt
          }
        })
      });
    })
  })

}