/**
 * The contents of this file are subject to the OpenMRS Public License
 * Version 1.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://license.openmrs.org
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 *
 * Copyright (C) OpenMRS, LLC.  All Rights Reserved.
 */
package org.openmrs.web.controller.maintenance;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openmrs.GlobalProperty;
import org.openmrs.api.context.Context;
import org.openmrs.module.Module;
import org.openmrs.module.ModuleFactory;

/**
 *
 */
public class SettingsDTO {

	/** Logger for this class */
	protected final Log log = LogFactory.getLog(getClass());

	private List<Module> modules;

	private List<GlobalProperty> systemSettings;
	
	private List<GlobalProperty> allSettings;
	
    /**
     * 
     */
    public SettingsDTO() {
    	
    	allSettings = Context.getAdministrationService().getAllGlobalProperties();
    	systemSettings = new ArrayList<GlobalProperty>();

    	for (GlobalProperty property : Context.getAdministrationService().getAllGlobalProperties()) {
    		systemSettings.add(property);
    	}
    	
    	log.debug("System Settings initial count: " + systemSettings.size());
    	
    	modules = new ArrayList<Module>(ModuleFactory.getStartedModules());
    	
    	Collections.sort(modules, new Comparator<Module>() {
            public int compare(Module m1, Module m2) {
	            return m1.getName().compareTo(m2.getName());
            }
    	});

    	for (Module module : modules) {

    		systemSettings.removeAll(module.getGlobalProperties());
    		
    		log.debug(module.getGlobalProperties().size()  + " properties from module "  + module.getName() + " was removed from System Settings");
        	log.debug("System Settings count: " + systemSettings.size());
    	}
    }
    
    /**
     * @return the allSettings
     */
    public List<GlobalProperty> getAllSettings() {
    	return allSettings;
    }

	/**
     * @return the globalProperties
     */
    public List<GlobalProperty> getSystemSettings() {
    	return systemSettings;
    }
	
    /**
     * @return the modules
     */
    public List<Module> getModules() {
    	return modules;
    }
	
}
