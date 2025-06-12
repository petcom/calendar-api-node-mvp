function getAllDescendantGroupIds(groups, parentId) {
  const result = [];
  const queue = [parentId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    result.push(currentId);

    const children = groups.filter(g => g.parentId === currentId);
    children.forEach(child => queue.push(child.id));
  }

  return result;
}

module.exports = { getAllDescendantGroupIds };
