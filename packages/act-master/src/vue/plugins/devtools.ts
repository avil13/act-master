import { setupDevtoolsPlugin } from '@vue/devtools-api';
import type { App } from 'vue';

import { type ActMaster } from '../..';

import type {
  CustomInspectorNode,
  CustomInspectorState,
} from './dev-tools-types';
import {
  getActEventsByMonkeyWatcher,
  hasMonkeyState,
  isShowActionByConfig,
  resetMonkeyWatcherState,
  sortActInspectorTree,
  toggleSettingsShowCall,
  useSettings,
  watchOnEventsByMonkey,
} from './lib/monkey-watch';
import { debounce, getArguments, logSettings } from './lib/utils';

// #region [ colors ]
// const PINK_500 = 0xec4899;
const BLUE_600 = 0x2563eb;
const LIME_500 = 0x84cc16;
const CYAN_400 = 0x22d3ee;
const ORANGE_400 = 0xfb923c;
const GRAY_100 = 0xf4f4f5;
const DARK = 0x666666;
// #endregion

export function addDevtools(app: App, actMaster: ActMaster) {
  const STATE_TYPE = 'ActMaster';
  const INSPECTOR_ID = 'actMaster';
  // const ACTIONS_LAYER_ID = 'actMaster:action';

  setupDevtoolsPlugin(
    {
      id: 'com.avil13',
      app,
      label: 'Act Master',
      packageName: 'act-master',
      homepage: 'https://avil13.github.io/act-master/',
      logo: 'https://avil13.github.io/act-master/assets/act-master-logo.svg',
      componentStateTypes: [STATE_TYPE],
    },
    (api) => {
      // Use the API here

      // #region [ inspector ]
      const currentSettings = useSettings(api.getSettings());

      logSettings('CALL_FILTER', currentSettings.isShowOnlyCalls);

      api.addInspector({
        id: INSPECTOR_ID,
        label: 'ActMaster 🥷',
        icon: 'gavel',
        treeFilterPlaceholder: 'Filter acts...',
        stateFilterPlaceholder: ' ',
        actions: [
          {
            icon: 'playlist_add_check',
            action: () => {
              debounce(200, () => {
                toggleSettingsShowCall(api, INSPECTOR_ID);
                // Settings are managed internally via useSettings
                // No need to call setSettings as it doesn't exist in the API

                logSettings('CALL_FILTER', currentSettings.isShowOnlyCalls);
              });
            },
            tooltip: 'Toggle show only Acts that have been called',
          },
          {
            icon: 'delete',
            action: () => {
              resetMonkeyWatcherState();
            },
            tooltip: 'Clears the call-state',
          },
        ],
      });

      api.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          payload.rootNodes = getActInspectorTree(actMaster, payload.filter);
        }
      });

      api.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          payload.state = getActInspectorState(actMaster, payload.nodeId);
        }
      });

      // #endregion
    }
  );
}

// #region [ HELPERS ]

function getActInspectorTree(
  actMaster: ActMaster,
  filter: string
): CustomInspectorNode[] {
  const list: CustomInspectorNode[] = [];

  const actions = actMaster._dev_.actions;
  const config = actMaster._dev_.devConf;
  const subMap = actMaster._dev_.listeners;

  const errorHandlerName = config.errorHandlerEventName || '';
  const filterLower = filter.toLowerCase();
  let maxLen = 0;

  actions.forEach((_, name) => {
    if (!isShowActionByConfig(name)) {
      return;
    }

    if (name.length > maxLen) {
      maxLen = name.length;
    }

    if (name.toLowerCase().includes(filterLower)) {
      const subs = subMap.get(name) || new Set();

      const tags = [
        {
          label: `subs: ${subs.size}`,
          textColor: LIME_500,
          backgroundColor: DARK,
        },
      ];

      if (errorHandlerName === name) {
        tags.push({
          label: 'Error Handler',
          textColor: ORANGE_400,
          backgroundColor: DARK,
        });
      }

      if (hasMonkeyState(name)) {
        tags.push({
          label: `call`,
          textColor: CYAN_400,
          backgroundColor: DARK,
        });
      }

      list.push({
        id: name,
        label: name,
        tags,
      });
    }
  });

  maxLen += 2;

  return sortActInspectorTree(list).map((item) => ({
    ...item,
    label: item.label.padEnd(maxLen, ' '),
  }));
}

export function getActInspectorState(
  actMaster: ActMaster,
  actName: string
): CustomInspectorState {
  const actions = actMaster._dev_.actions;
  const act = actions.get(actName) || null;
  const config = actMaster._dev_.devConf;
  const subsMap = actMaster._dev_.listeners;

  const subs = subsMap.get(actName) || new Set();

  watchOnEventsByMonkey(actMaster);

  let errorHandlerName = act?.$onError || config?.errorHandlerEventName || '❌';
  if (errorHandlerName === actName) {
    errorHandlerName = '';
  }

  const args: string[] = getArguments(act?.exec);

  return {
    [`Act name: "${actName}"`]: [
      {
        key: 'subscribers',
        value: subs.size,
      },
      {
        key: 'errorHandlerEventName',
        value: errorHandlerName,
        // raw: 'string;'
      },
      {
        key: 'watch',
        value: (act?.$watch || []).join(', '),
      },
      {
        key: 'isSingleExec',
        value: act?.$isSingleton || false,
      },
      {
        key: 'validateInput',
        value: act?.$validate || false,
      },
      {
        key: 'arguments',
        value: `(${args.join(', ')})`,
      },
    ],

    'Data passed:': getActEventsByMonkeyWatcher(actName, act),
  };
}

// #endregion
