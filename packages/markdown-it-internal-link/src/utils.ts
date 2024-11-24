export const normalizeLink = (link: string) => {
  return encodeURI(link).replace(/\.md$/g, ".html");
};
