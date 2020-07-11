/**
 * Извлекает из объекта значение свойства по указанному пути
 * @param path Путь к свойству, указанный в формате 'field1.field2'
 * @param source Объект, из которого необходимо извлечь свойство
 */
export const fieldExtractor = <T>(path: string, source: any): T => {
  const paths: string[] = path.split('.');
  const field = source[paths[0]];
  return paths.length === 1 ? field : field ? fieldExtractor(path.slice(paths[0].length + 1, path.length), field) : undefined;
};
