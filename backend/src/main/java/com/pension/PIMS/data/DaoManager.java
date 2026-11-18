package com.pension.PIMS.data;

import com.pension.PIMS.data.Ifaces.*;
import org.springframework.stereotype.Component;

@Component
public class DaoManager {
    private final UserDao userDao;
    private final CategoryDao categoryDao;
    private final ItemDao itemDao;
    private final ItemRequestDao itemRequestDao;
    private final ItemAssignmentDao itemAssignmentDao;
    private final ItemMaintenanceDao itemMaintenanceDao;
    private final PensionPointDao pensionPointDao;

    public DaoManager(UserDao userDao, CategoryDao categoryDao, ItemDao itemDao, ItemRequestDao itemRequestDao, ItemAssignmentDao itemAssignmentDao, ItemMaintenanceDao itemMaintenanceDao, PensionPointDao pensionPointDao) {
        this.userDao = userDao;
        this.categoryDao = categoryDao;
        this.itemDao = itemDao;
        this.itemRequestDao = itemRequestDao;
        this.itemAssignmentDao = itemAssignmentDao;
        this.itemMaintenanceDao = itemMaintenanceDao;
        this.pensionPointDao = pensionPointDao;
    }

    public UserDao getUserDao() {
        return userDao;
    }

    public CategoryDao getCategoryDao() {
        return categoryDao;
    }

    public ItemDao getItemDao() {
        return itemDao;
    }

    public ItemRequestDao getItemRequestDao() {
        return itemRequestDao;
    }

    public ItemAssignmentDao getItemAssignmentDao() {
        return itemAssignmentDao;
    }

    public ItemMaintenanceDao getItemMaintenanceDao() {
        return itemMaintenanceDao;
    }

    public PensionPointDao getPensionPointDao() {
        return pensionPointDao;
    }
}
