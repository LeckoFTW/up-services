import { Role } from '../models/role';

export const RoleController = {
  findByName(name) {
    return Role.findOne({ name });
  },

  fintListByIds(ids) {
    return Role.find({ _id: { $in: ids } });
  },
};
