import { MathUtils } from '@blockcode/utils';
import { addLocalesMessages, Text } from '@blockcode/core';

import translations from './l10n.yaml';
import iconImage from './icon.svg';
import ntptimeFile from './ntptime.py';

addLocalesMessages(translations);

export default {
  icon: iconImage,
  name: (
    <Text
      id="blocks.time.name"
      defaultMessage="Time"
    />
  ),
  files: [
    {
      name: 'ntptime',
      type: 'text/x-python',
      uri: ntptimeFile,
    },
  ],
  emulator() {
    return {
      get key() {
        return 'time';
      },

      timezone: 8,

      setTimezone(timezone) {
        this.timezone = MathUtils.toNumber(timezone);
      },

      getTime(option) {
        const date = new Date();
        const localTimezone = date.getTimezoneOffset() / 60;
        const timezoneOffset = localTimezone + this.timezone;
        const timezoneDate = new Date(Date.now() + timezoneOffset * 3600 * 1000);
        switch (option) {
          case 'year':
            return timezoneDate.getFullYear();
          case 'month':
            return timezoneDate.getMonth() + 1;
          case 'date':
            return timezoneDate.getDate();
          case 'weekday':
            return timezoneDate.getDay() === 0 ? 7 : timezoneDate.getDay();
          case 'hour':
            return timezoneDate.getHours();
          case 'minute':
            return timezoneDate.getMinutes();
          case 'second':
            return timezoneDate.getSeconds();
          default:
            return 0;
        }
      },

      getDays() {
        const date = new Date();
        const start = new Date('2000-01-01T00:00:00');
        const days = (date - start) / (1000 * 3600 * 24);
        return days.toFixed(6);
      },
    };
  },
  blocks: [
    {
      id: 'getTime',
      text: (
        <Text
          id="blocks.time.getTime"
          defaultMessage="current [OPTION]"
        />
      ),
      output: 'number',
      inputs: {
        OPTION: {
          defaultValue: 'year',
          menu: [
            [
              <Text
                id="blocks.time.option.year"
                defaultMessage="year"
              />,
              'year',
            ],
            [
              <Text
                id="blocks.time.option.month"
                defaultMessage="month"
              />,
              'month',
            ],
            [
              <Text
                id="blocks.time.option.date"
                defaultMessage="date"
              />,
              'date',
            ],
            [
              <Text
                id="blocks.time.option.weekday"
                defaultMessage="day of week"
              />,
              'weekday',
            ],
            [
              <Text
                id="blocks.time.option.hour"
                defaultMessage="hour"
              />,
              'hour',
            ],
            [
              <Text
                id="blocks.time.option.minute"
                defaultMessage="minute"
              />,
              'minute',
            ],
            [
              <Text
                id="blocks.time.option.second"
                defaultMessage="second"
              />,
              'second',
            ],
          ],
        },
      },
      emu(block) {
        const option = this.quote_(block.getFieldValue('OPTION') || 'year');
        const code = `runtime.extensions.time.getTime(${option})`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
      mpy(block) {
        const option = this.quote_(block.getFieldValue('OPTION') || 'year');
        const code = `ntptime.get_time(${option})`;
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    {
      id: 'days',
      text: (
        <Text
          id="blocks.time.days"
          defaultMessage="days since 2000"
        />
      ),
      output: 'number',
      emu(block) {
        const code = 'runtime.extensions.time.getDays()';
        return [code, this.ORDER_FUNCTION_CALL];
      },
      mpy(block) {
        const code = 'ntptime.get_days()';
        return [code, this.ORDER_FUNCTION_CALL];
      },
    },
    '---',
    {
      id: 'setTimezone',
      text: (
        <Text
          id="blocks.time.setTimezone"
          defaultMessage="set timezone to [TIMEZONE]"
        />
      ),
      inputs: {
        TIMEZONE: {
          type: 'number',
          defaultValue: '8',
        },
      },
      emu(block) {
        const timezone = this.valueToCode(block, 'TIMEZONE', this.ORDER_NONE) || '8';
        const code = `runtime.extensions.time.setTimezone(${timezone})\n`;
        return code;
      },
      mpy(block) {
        const timezone = this.valueToCode(block, 'TIMEZONE', this.ORDER_NONE) || '8';
        const code = `ntptime.timezone = num(${timezone})\n`;
        return code;
      },
    },
    '---',
    {
      id: 'sync',
      text: (
        <Text
          id="blocks.time.sync"
          defaultMessage="sync world time"
        />
      ),
      mpy(block) {
        const code = 'await ntptime.async_world_time()\n';
        return code;
      },
    },
  ],
};
