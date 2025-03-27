const mockData = {
  shopping_items: [
    {
      id: '1',
      user_id: 'test-user',
      name: 'Test Item',
      amount: 1,
      unit: 'unit',
      category: 'test',
      checked: false,
      shopping_item_recipes: [],
    },
  ],
  shopping_item_recipes: [],
};

function createQueryBuilder(table) {
  let currentQuery = {
    table,
    conditions: [],
    data: null,
    selectedFields: '*',
    orderBy: null,
    isAscending: true,
    operation: null,
  };

  const builder = {
    data: null,
    error: null,

    select: function (fields) {
      currentQuery.selectedFields = fields;
      currentQuery.operation = 'select';
      return builder;
    },

    insert: function (data) {
      currentQuery.data = Array.isArray(data) ? data : [data];
      currentQuery.operation = 'insert';
      const insertedData = currentQuery.data.map((item) => ({
        id: Math.random().toString(36).substring(7),
        ...item,
      }));
      mockData[table] = [...(mockData[table] || []), ...insertedData];
      builder.data = insertedData.length === 1 ? insertedData[0] : insertedData;
      return builder;
    },

    update: function (data) {
      currentQuery.data = data;
      currentQuery.operation = 'update';
      return builder;
    },

    delete: function () {
      currentQuery.operation = 'delete';
      return builder;
    },

    eq: function (field, value) {
      currentQuery.conditions.push({ field, value, operator: 'eq' });
      return builder;
    },

    order: function (field, { ascending = true } = {}) {
      currentQuery.orderBy = field;
      currentQuery.isAscending = ascending;
      return builder;
    },

    single: function () {
      let filteredData = mockData[table].filter((item) =>
        currentQuery.conditions.every(
          (condition) => item[condition.field] === condition.value
        )
      );

      if (currentQuery.operation === 'insert') {
        return { data: builder.data, error: null };
      }

      if (currentQuery.operation === 'update' && filteredData.length > 0) {
        filteredData.forEach((item) => {
          Object.assign(item, currentQuery.data);
        });
      }

      if (currentQuery.operation === 'delete' && filteredData.length > 0) {
        mockData[table] = mockData[table].filter(
          (item) => !filteredData.includes(item)
        );
      }

      return {
        data: filteredData[0] || null,
        error: null,
      };
    },

    then: function (callback) {
      let result = { data: null, error: null };
      let filteredData = mockData[table].filter((item) =>
        currentQuery.conditions.every(
          (condition) => item[condition.field] === condition.value
        )
      );

      if (currentQuery.orderBy) {
        filteredData.sort((a, b) => {
          if (currentQuery.isAscending) {
            return a[currentQuery.orderBy] > b[currentQuery.orderBy] ? 1 : -1;
          }
          return a[currentQuery.orderBy] < b[currentQuery.orderBy] ? 1 : -1;
        });
      }

      switch (currentQuery.operation) {
        case 'insert':
          result = { data: builder.data, error: null };
          break;

        case 'update':
          filteredData.forEach((item) => {
            Object.assign(item, currentQuery.data);
          });
          result = { data: filteredData, error: null };
          break;

        case 'delete':
          mockData[table] = mockData[table].filter(
            (item) => !filteredData.includes(item)
          );
          result = { data: filteredData, error: null };
          break;

        default:
          result = { data: filteredData, error: null };
      }

      return Promise.resolve(result).then(callback);
    },
  };

  return builder;
}

export const supabase = {
  from: (table) => createQueryBuilder(table),
  auth: {
    getUser: async () => ({
      data: { id: 'test-user' },
      error: null,
    }),
  },
};
