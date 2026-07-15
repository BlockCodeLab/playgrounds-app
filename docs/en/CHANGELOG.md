## CHANGELOG

### v1.5.0

- Updated the Block Editor
  - Updated CodexPad blocks to add more key‑state blocks
  - Optimized some block description texts

- Added loading and saving of local custom extensions, [Custom Extension Documentation](https://app.blockcode.fun/#/custom-extension)
- Updated the download button in the menu bar to connect directly to devices
- Fixed known bugs

### v1.4.7

- Updated the Arduino Editor to v0.6.3
  - Added code generation for multidimensional arrays

- Updated the LGT8F328P Editor to v0.2.2
  - Added code generation for multidimensional arrays

- Updated the iot:bit Editor to v0.3.1
  - Added simulator control panel
  - Optimized simulator resource loading

- Updated the Scratch Arcade Editor to v1.1.4
  - Fixed issue where blank dialog content did not disappear

- Updated the Block Editor
  - Updated the MAX7219 dot matrix extension to support multiple devices connected
  - Added multidimensional array blocks

- Fixed known bugs

### v1.4.6

- Updated the iot:bit Editor to v0.3.0
  - Updated simulator functionality
  - Optimized pin values
  - Optimized code panel and serial port panel display

- Removed the writing component and writing editor (will be loaded independently in the future)
- Fixed simulator getting stuck in an infinite loop
- Fixed known bugs

### v1.4.5

- Updated the ESP32 Editor to v0.2.7
  - Added pin low‑level detection block
  - Added color value block
  - Optimized program download and firmware restore
  - Optimized block adjustments

- Updated the iot:bit Editor to v0.2.5
  - Added pin low‑level detection block
  - Added color value block
  - Optimized program download and firmware restore
  - Optimized block adjustments

- Updated the Arduino Editor to v0.6.2
  - Added pin low‑level detection block
  - Added color value block
  - Optimized block adjustments

- Updated the LGT8F328P Editor to v0.2.1
  - Added pin low‑level detection block
  - Added color value block
  - Optimized block adjustments

- Updated the Block Editor
  - Added support for holding Ctrl (Command on macOS) to drag only a single block
  - Added support for holding Alt to copy the dragged block (or group)
  - Updated library files for the Motor Driver Board extension
  - Updated library files for the CodexPad extension

- Updated the Code Editor
  - Updated log and serial panel styles, now resizable
  - Optimized data sending in the terminal serial

- Fixed known bugs

### v1.4.4

- Updated the iot:bit Editor to v0.2.4
  - Updated code preview
  - Optimized simulator

- Updated the Block Editor
  - Added Mini-Joystick gamepad extension
  - Optimized default pins for extensions (for iot:bit)
  - Optimized translation texts

- Fixed known bugs

### v1.4.3

- Updated ESP32 Editor to v0.2.6
  - Added firmware download links for ESP32/ESP32S3

- Updated LGT8F328P Editor to v0.2.0
  - Updated blocks

- Updated Block Editor
  - Added Motor Driver Board extension
  - Added MP3 player module
  - Added comment block

### v1.4.2

- Updated Arduino Editor to v0.6.1
  - Added HEX format numeric input block
  - Optimized random number block

- Updated Block Editor
  - Added RTC clock module supporting DS1307/DS3231/PCF8563/PCF8523/MCP7940
  - Added QMC5883L compass extension
  - Added CodexPad series wireless gamepad extension
  - Updated motor extension to distinguish single/dual PWM mode driving
  - Updated infrared communication extension blocks
  - Updated WS2812 LED strip batch update block
  - Fixed WS2812 animation error on ESP32

### v1.4.1

- Updated the IOT:BIT Editor to v0.2.3
  - Optimized WiFi connection process
  - Optimized firmware recovery process

- Updated the ESP32 Editor to v0.2.5
  - Optimized firmware recovery process

- Updated the Arduino Editor to v0.6.0
  - Added RF-NANO development board

- Updated the Block Editor
  - Added RF communication extension
  - Added LD3320 voice recognition extension
  - Optimized event polling code
  - Fixed RGB LED light code conversion error

- Fixed known bugs

### v1.4.0

- Added LGT8F328P Editor v0.1.0
  - Supports three development boards: NULLLAB LGT Mango UNO, LGT Nano, and Mini Nano

- Updated the Arduino Editor to v0.5.7
  - Added multitasking event blocks

- Updated the ESP32 Editor to v0.2.4
  - Optimized WiFi connection process
  - Log panel opened by default

- Updated the Code Editor
  - Optimized default configuration

- Updated the Block Editor
  - Added Sentry/Sengo vision sensor
  - Updated Matrix7219 block pin order
  - Updated BMX280 barometric pressure unit display
  - Updated LCD initial screen brightness
  - Made code preview window resizable

### v1.3.9

- Updated the Block Editor
  - Updated RFID extension to support ESP32
  - Updated OLED monochrome display extension to support ESP32
  - Updated LCD1602 display extension to support ESP32
  - Updated Color Recognition extension to support ESP32
  - Updated MIDI module extension to support ESP32
  - Fixed block screenshot being cropped due to scaling

### v1.3.8

- Updated the Arduino Editor to v0.5.6
  - Optimized pin code logic

- Updated the Block Editor
  - Added ESP32C2 MQTT communication extension (Arduino only)
  - Updated IO extension to support ESP32
  - Updated MD40 motor driver to support ESP32
  - Updated DM11 motor driver to support ESP32
  - Updated Matrix Keypad extension to support ESP32
  - Updated Touch Piano extension to support ESP32
  - Updated Ultrasonic Ranging extension to support ESP32
  - Updated OLED display driver type
  - Fixed WS2812 RGB LED extension error

- Fixed known bugs

### v1.3.7

- Updated the ESP32 Editor to v0.2.3
  - Optimized string conversion code

- Updated the Arduino Editor to v0.5.5
  - Optimized text translations
  - Optimized string conversion code
  - Optimized event polling conversion code
  - Optimized data types

- Updated the Block Editor
  - Added TTS20 speech synthesis extension
  - Updated analog value extension to Simple Sensor extension
  - Updated WS2812 RGB LED extension blocks
  - Updated Button extension blocks
  - Updated Infrared Communication extension blocks
  - Updated OLED display extension blocks
  - Updated multiple extension icons
  - Updated Chinese variable and function name conversion

- Fixed some bugs

### v1.3.6

- Updated the Arduino Editor to v0.5.4
  - Optimized default projects
  - Optimized code conversion rules for repeat blocks
  - Fixed extension pin errors

- Updated the ESP32 Editor to v0.2.2
  - Optimized default projects
  - Fixed extension pin errors

- Updated the iot:bit Editor to v0.2.2
  - Optimized default projects
  - Fixed simulator display issues
  - Fixed extension pin errors

- Updated the Markdown Editor to v0.1.2
  - Fixed offline version startup error

- Updated the Block Editor
  - Updated AI voice assistant extension tutorial

- Added extension tutorial loading
- Added Chinese New Year Easter egg
- Fixed some bugs

### v1.3.5

- Updated the Arduino Editor to v0.5.3
  - Added support for the NL-16 wireless downloader, enabling ordinary Arduino boards to download programs wirelessly via NL-16
  - Fixed pin type errors

- Updated the Block Editor
  - Added MIDI module extension (Arduino only)
  - Added LCD1602 display extension (Arduino only)
  - Added OLED monochrome display extension (Arduino only)
  - Added AI voice assistant extension

- Fixed some bugs

### v1.3.4

- Updated the Arduino Editor to v0.5.2
  - Added polling and event timer code conversion

- Updated the iot:bit Editor to v0.2.1
  - Added a download button in the menu bar

- Updated the Markdown Editor to v0.1.1
  - Added export to .md document

- Updated the Block Editor
  - Added IO extension (Arduino only)
  - Added RFID extension (Arduino only)
  - Added Color Recognition extension (Arduino only)
  - Fixed NES extension download error

- Fixed some bugs

### v1.3.3

- Updated the ESP32 Editor to v0.2.1
  - Added a download button in the menu bar

- Updated the Arduino Editor to v0.5.1
  - Optimized timer blocks

- Updated the Block Editor
  - Added Universal Motor Driver extension
  - Added MD40 Motor Driver extension (Arduino only)
  - Added DM11 Motor Driver extension (Arduino only)
  - Added Geekservo Servo extension
  - Updated Stepper Motor extension to support Arduino
  - Optimized Keypad extension timer

- Added direct editor access via URL
- Optimized hardware connection and downloading
- Fixed some bugs

### v1.3.2

- Updated the Arduino Editor to v0.5.1
  - Added a download button in the menu bar

- Updated the Block Editor
  - Added Infrared Communication extension (Arduino only)
  - Added Matrix Keypad extension (Arduino only)
  - Added Touch Piano extension (Arduino only)
  - Added Ultrasonic Distance Measurement extension (Arduino only)
  - Added block size adjustment
  - Modified default block size and styling

- Updated the Code Editor
  - Added terminal clear button

- Added log copy button
- Added serial window clear button
- Added menu bar icon button layout
- Optimized block image export
- Fixed some bugs

### v1.3.1

- Updated Arduino editor to v0.5.0
  - Optimized compilation
  - Improved some blocks

- Updated iot:bit editor to v0.2.0
  - Added simulator (basic feature simulation; more features will be gradually added later)

- Updated block editor
  - Added code execution blocks
  - Added key input extension
  - Updated WS2812 LED extension for Arduino compatibility
  - Optimized code conversion

- Fixed some bugs

### v1.3.0

- Updated Scratch Arcade Editor to v1.1.3
  - Added community group QR code

- Updated iot:bit Editor to v0.1.1
  - Updated blocks

- Updated ESP32 Editor to v0.2.0
  - Added support for NULLLAB ESP32S3 CAM board
  - Updated blocks

- Updated Arduino Editor to v0.4.0
  - Added serial debugging page
  - Added baud rate selection for serial communication
  - Added log information
  - Updated blocks

- Updated Code Editor
  - Optimized terminal connection

- Added log and serial panel
- Added View menu
- Added code editing mode menu item
- Optimized local save path selection
- Fixed some issues

### v1.2.0

- Added Markdown Editor v0.1.0
  - Basic document editing

- Added iot:bit Editor v0.1.0
  - Added Terminal page
  - Added Soft Reset menu item
  - Adapted extensions

- Updated Scratch Arcade Editor to v1.1.2
  - Optimized code conversion

- Updated Arduino Editor to v0.3.0
  - Added offline compilation extension service
  - Optimized code conversion

- Updated ESP32 Editor to v0.1.5
  - Added Terminal page
  - Added Soft Reset menu item
  - Optimized code conversion

- Updated Code Editor
  - Added Terminal emulator

- Updated Block Editor
  - Added MAX7219 LED Matrix extension
  - Added TM1637 Time Display extension
  - Added TM1650 Four-Digit Display extension
  - Added VK16K33 Four-Digit Display extension
  - Added LED Light extension
  - Added DHT Temperature & Humidity extension
  - Added Temperature extension
  - Added Buzzer extension
  - Added Analog Input extension
  - Updated Servo extension
  - Optimized block-to-code conversion and comments
  - Improved compatibility of some extensions

- Added local block extensions and editor loading
- Added local tutorial loading
- Optimized "Save to Local" path selection
- Fixed some bugs

### v1.1.0

- Updated Scratch Arcade Editor to v1.1.1
  - Added joystick/directional pad toggle
- Updated Arduino Editor to v0.2.0
  - Added offline compilation for Arduino
- Updated Block Editor
  - Added variable monitoring (show/hide)
  - Added Wireless Programming Kit extension (beta)
  - Optimized simulator logic for improved performance
- Enhanced compatibility for certain extensions
- Fixed various bugs

### v1.0.6

- Released ESP32 Editor v0.1.0 Beta
- Updated Scratch Arcade Editor to v1.1.0
  - Added deletion and flipping operations for costumes
- Added hardware sound support (stage)
- Added ESP32 Showcase Projects
- Optimized compatibility issues
- Fixed some bugs

### v1.0.5

- Released Arduino Editor v0.1.0 Beta
- Updated Scratch Arcade Editor to v1.0.6
  - Added image resizing feature in the costume editor
- Added right-click menu function to export block images
- Loaded featured project examples from the network
- UI style adjustments
- Optimized serial and Bluetooth connectivity
- Improved compatibility issues
- Fixed various bugs

### v1.0.4

- Added WebSocket extension
- Added translation extension
- Updated Scratch Arcade editor to v1.0.5
- Improved compatibility
- Fixed some bugs

### v1.0.1

- Added Windows 7 compatible version
- Improved compatibility
- Fixed various bugs

### v1.0.0

Initial version.
