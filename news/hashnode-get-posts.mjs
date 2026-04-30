import "dotenv/config";
import { wait } from "./utils.js";
import { writeFileSync } from "fs";
import { gql, request } from "graphql-request";

const constructIndex = async () => {
  const postFieldsFragment = gql`
    fragment PostFields on Post {
      id
      slug
      title
      author {
        id
        username
        name
        bio {
          text
        }
        profilePicture
        socialMediaLinks {
          website
          twitter
          facebook
          instagram
          github
          stackoverflow
          linkedin
          youtube
        }
        location
      }
      tags {
        id
        name
        slug
      }
      coverImage {
        url
      }
      brief
      readTimeInMinutes
      content {
        html
      }
      seo {
        description
      }
      publishedAt
      updatedAt
    }
  `;

  const query = gql`
    ${postFieldsFragment}
    query DataFromPublication($host: String!, $first: Int!, $after: String) {
      publication(host: $host) {
        id
        posts(first: $first, after: $after) {
          edges {
            node {
              ...PostFields
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  `;

  const data = [];
  let after = "";
  let hasNextPage = true;

  while (hasNextPage) {
    const res = await request(process.env.HASHNODE_API_URL, query, {
      host: process.env.ENGLISH_HASHNODE_HOST,
      first: 20,
      after,
    });

    const resData = res.publication.posts?.edges.map(({ node }) => node) || [];
    const pageInfo = res.publication.posts?.pageInfo;

    resData.forEach((post) => {
      const algoliaFilterRegex = [/java\b/i];
      const thisPost = {
        objectID: post.id,
        title: post.title,
        author: {
          name: post.author.name,
          url: `https://www.freecodecamp.org/news/author/${post.author.username}`,
          profileImage: post.author.profilePicture,
        },
        tags: post.tags.map((tag) => {
          return {
            name: tag.name,
            url: `https://www.freecodecamp.org/news/tag/${tag.slug}/`,
          };
        }),
        url: `https://www.freecodecamp.org/news/${post.slug}/`,
        featureImage: post.coverImage?.url,
        publishedAt: post.publishedAt,
        publishedAtTimestamp: (new Date(post.publishedAt).getTime() / 1000) | 0,
        filterTerms: algoliaFilterRegex.reduce((acc, regex) => {
          const isMatch = post.title.match(regex);
          if (isMatch) acc.push(isMatch[0].toLowerCase());

          return acc;
        }, []),
      };

      data.push(thisPost);

      // data.push(post);
    });

    if (resData.length > 0)
      console.log(
        `Fetched Hashnode posts ${pageInfo.endCursor}... and using ${
          process.memoryUsage.rss() / 1024 / 1024
        } MB of memory`,
      );

    after = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage;

    writeFileSync(`en-hashnode-posts.json`, JSON.stringify(data, null, 2));
    await wait(0.5);
  }
};

constructIndex();
