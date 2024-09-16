const attributes: Attributes = {
  priority: {},
  projects: {},
  contexts: {},
  due: {} as DateAttribute,
  t: {} as DateAttribute,
  rec: {},
  pm: {},
  created: {} as DateAttribute,
  completed: {} as DateAttribute,
};

function getDateAttributes(): DateAttributes {
  return {
    due: attributes.due,
    t: attributes.t,
    created: attributes.created,
    completed: attributes.completed,
  };
}

function incrementCount(countObject: any, key: any | null, notify: boolean): void {
  if(key) {
    let previousCount: number = parseInt(countObject[key]?.count) || 0;
    countObject[key] = {
      count: previousCount + 1,
      notify: notify,
    }
  }
}

function updateAttributes(todoObjects: TodoObject[], sorting: Sorting[], reset: boolean) {

  const attributeKeys = Object.keys(attributes) as AttributeKey[];

  for (const key of attributeKeys) {

    for (const attributeKey in attributes[key]) {
      if (reset) {
        if (Object.keys(getDateAttributes()).includes(key)) {
          attributes[key as DateAttributeKey] = {
            date: null,
            string: null,
            type: null,
            notify: false,
          };
        } else {
          attributes[key as NonDateAttributeKey] = {};
        }
      } else {
        const attribute = attributes[key];
        const attributeValue = attribute[attributeKey as keyof typeof attribute];
        if (attributeValue !== null && typeof attributeValue === 'object') {
          attributeValue.count = 0;
        }
      }
    };

    for (const todoObject of todoObjects) {
      const value = todoObject[key as keyof TodoObject];
      const notify: boolean = (key === 'due') ? !!todoObject?.notify : false;

      if(Array.isArray(value)) {
        for (const element of value) {
          if(element !== null) {
            const attributeKey = element as keyof Attribute;

            incrementCount(attributes[key], attributeKey, notify);
          }
        }
      } else {
        if(value !== null) {
          incrementCount(attributes[key], value, notify);
        }
      }
    }

    const sortedAttributes = Object.fromEntries(
      Object.entries(attributes[key])
        .sort(([a], [b]) => a.localeCompare(b))
    );
    if (Object.keys(getDateAttributes()).includes(key)) {
      attributes[key as DateAttributeKey] = sortedAttributes as DateAttribute;
    } else {
      attributes[key as NonDateAttributeKey] = sortedAttributes as NonDateAttribute;
    }
  }
}

export { attributes, getDateAttributes, updateAttributes };
