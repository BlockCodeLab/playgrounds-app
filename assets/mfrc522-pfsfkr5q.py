from machine import I2C, Pin


class MFRC522:
    # Define register values from datasheet
    COMMANDREG = 0x01  # Start and stops command execution
    COMIENREG = 0x02  # Enable and disable interrupt request control bits
    COMIRQREG = 0x04  # Interrupt request bits
    DIVIRQREG = 0x05  # Interrupt request bits
    ERRORREG = 0x06  # Error bits showing the error status of the last command
    STATUS2REG = 0x08  # Receiver and transmitter status bits
    FIFODATAREG = 0x09  # Input and output of 64 byte FIFO buffer
    FIFOLEVELREG = 0x0A  # Number of bytes stored in the FIFO buffer
    CONTROLREG = 0x0C  # Miscellaneous control register
    BITFRAMINGREG = 0x0D  # Adjustments for bit-oriented frames
    MODEREG = 0x11  # Defines general modes for transmitting and receiving
    TXCONTROLREG = 0x14  # Controls the logical behavior of the antenna pins
    TXASKREG = 0x15  # Controls the setting of the transmission modulation
    CRCRESULTREGMSB = 0x21  # Shows the MSB of the CRC calculation
    CRCRESULTREGLSB = 0x22  # Shows the LSB of the CRC calculation
    TMODEREG = 0x2A  # Defines settings for the internal timer
    TPRESCALERREG = 0x2B  # Defines settings for internal timer
    TRELOADREGH = 0x2C  # Defines 16-bit timer reload value
    TRELOADREGL = 0x2D  # Defines 16-bit timer reload value
    VERSIONREG = 0x37  # Shows the software version

    # MFRC522 Commands
    MFRC522_IDLE = 0x00  # No actions, cancels current command execution
    MFRC522_CALCCRC = 0x03  # Activates the CRC coprocessor and performs a self test
    MFRC522_TRANSCEIVE = 0x0C  # Transmits data from FIFO buffer to antenna and automatically activates the receiver after transmission
    MFRC522_MFAUTHENT = 0x0E  # Performs the MIFARE standard authentication as a reader
    MFRC522_SOFTRESET = 0x0F  # Resets the MFRC522

    # MIFARE Classic Commands
    MIFARE_REQUEST = [0x26]
    MIFARE_WAKEUP = [0x52]
    MIFARE_ANTICOLCL1 = [0x93, 0x20]
    MIFARE_SELECTCL1 = [0x93, 0x70]
    MIFARE_ANTICOLCL2 = [0x95, 0x20]
    MIFARE_SELECTCL2 = [0x95, 0x70]
    MIFARE_HALT = [0x50, 0x00]
    MIFARE_AUTHKEY1 = [0x60]
    MIFARE_AUTHKEY2 = [0x61]
    MIFARE_READ = [0x30]
    MIFARE_WRITE = [0xA0]
    MIFARE_DECREMENT = [0xC0]
    MIFARE_INCREMENT = [0xC1]
    MIFARE_RESTORE = [0xC2]
    MIFARE_TRANSFER = [0xB0]

    # Mifare 1K EEPROM is arranged of 16 sectors. Each sector has 4 blocks and
    # each block has 16-byte. Block 0 is a special read-only data block that
    # keeps the manufacturer data and the UID of the tag. The sector trailer
    # block, the last block of the sector, holds the access conditions and two
    # of the authentication keys for that particular sector
    MIFARE_1K_MANUFAKTURERBLOCK = [0]
    MIFARE_1K_SECTORTRAILER = [
        3,
        7,
        11,
        15,
        19,
        23,
        27,
        31,
        35,
        39,
        43,
        47,
        51,
        55,
        59,
        63,
    ]
    MIFARE_1K_DATABLOCK = [
        1,
        2,
        4,
        5,
        6,
        8,
        9,
        10,
        12,
        13,
        14,
        16,
        17,
        18,
        20,
        21,
        22,
        24,
        25,
        26,
        28,
        29,
        30,
        32,
        33,
        34,
        36,
        37,
        38,
        40,
        41,
        42,
        44,
        45,
        46,
        48,
        49,
        50,
        52,
        53,
        54,
        56,
        57,
        58,
        60,
        61,
        62,
    ]

    # Mifare 4K EEPROM is arranged of 40 sectors. From sector 0 to 31, memory
    # organization is similar to Mifare 1K, each sector has 4 blocks. From
    # sector 32 to 39, each sector has 16 blocks
    MIFARE_4K_MANUFAKTURERBLOCK = [0]
    MIFARE_4K_SECTORTRAILER = [
        3,
        7,
        11,
        15,
        19,
        23,
        27,
        31,
        35,
        39,
        43,
        47,
        51,
        55,
        59,
        63,
        67,
        71,
        75,
        79,
        83,
        87,
        91,
        95,
        99,
        103,
        107,
        111,
        115,
        119,
        123,
        127,
        143,
        159,
        175,
        191,
        207,
        223,
        239,
        255,
    ]
    MIFARE_4K_DATABLOCK = [
        1,
        2,
        4,
        5,
        6,
        8,
        9,
        10,
        12,
        13,
        14,
        16,
        17,
        18,
        20,
        21,
        22,
        24,
        25,
        26,
        28,
        29,
        30,
        32,
        33,
        34,
        36,
        37,
        38,
        40,
        41,
        42,
        44,
        45,
        46,
        48,
        49,
        50,
        52,
        53,
        54,
        56,
        57,
        58,
        60,
        61,
        62,
        64,
        65,
        66,
        68,
        69,
        70,
        72,
        73,
        74,
        76,
        77,
        78,
        80,
        81,
        82,
        84,
        85,
        86,
        88,
        89,
        90,
        92,
        93,
        94,
        96,
        97,
        98,
        100,
        101,
        102,
        104,
        105,
        106,
        108,
        109,
        110,
        112,
        113,
        114,
        116,
        117,
        118,
        120,
        121,
        122,
        124,
        125,
        126,
        128,
        129,
        130,
        131,
        132,
        133,
        134,
        135,
        136,
        137,
        138,
        139,
        140,
        141,
        142,
        144,
        145,
        146,
        147,
        148,
        149,
        150,
        151,
        152,
        153,
        154,
        155,
        156,
        157,
        158,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        174,
        176,
        177,
        178,
        179,
        180,
        181,
        182,
        183,
        184,
        185,
        186,
        187,
        188,
        189,
        190,
        192,
        193,
        194,
        195,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        208,
        209,
        210,
        211,
        212,
        213,
        214,
        215,
        216,
        217,
        218,
        219,
        220,
        221,
        222,
        224,
        225,
        226,
        227,
        228,
        229,
        230,
        231,
        232,
        233,
        234,
        235,
        236,
        237,
        238,
        240,
        241,
        242,
        243,
        244,
        245,
        246,
        247,
        248,
        249,
        250,
        251,
        252,
        253,
        254,
    ]

    MIFARE_KEY = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]

    MIFARE_OK = 0
    MIFARE_NOTAGERR = 1
    MIFARE_ERR = 2

    MAX_LEN = 16

    def __init__(self, scl, sda, i2c_addr=0x28, i2c_id=1, freq=400000):
        """
        Initialize MFRC522 driver.
        :param i2c: machine.I2C object already configured
        :param addr: I2C address of MFRC522 (default 0x28)
        """
        self.i2c = I2C(i2c_id, scl=Pin(scl), sda=Pin(sda), freq=freq)
        self.addr = i2c_addr
        self.__MFRC522_init()

    def __MFRC522_read(self, address):
        """Read a single byte from the given register."""
        return self.i2c.readfrom_mem(self.addr, address, 1)[0]

    def __MFRC522_write(self, address, value):
        """Write a single byte to the given register."""
        self.i2c.writeto_mem(self.addr, address, bytes([value]))

    def __MFRC522_setBitMask(self, address, mask):
        """Set bits according to mask in a register."""
        value = self.__MFRC522_read(address)
        self.__MFRC522_write(address, value | mask)

    def __MFRC522_clearBitMask(self, address, mask):
        """Clear bits according to mask in a register."""
        value = self.__MFRC522_read(address)
        self.__MFRC522_write(address, value & (~mask))

    def getReaderVersion(self):
        version = self.__MFRC522_read(self.VERSIONREG)
        if version == 0x91:
            return "v1.0"
        elif version == 0x92:
            return "v2.0"
        else:
            return None

    def scan(self):
        """Scans for a card and returns the UID."""
        self.__MFRC522_write(self.BITFRAMINGREG, 0x07)  # None bits of the last byte
        buffer = self.MIFARE_REQUEST.copy()
        status, backData, backBits = self.__transceiveCard(buffer)
        if (status != self.MIFARE_OK) or (backBits != 0x10):
            status = self.MIFARE_ERR
        return status, backData, backBits

    def __serialNumberValid(self, serialNumber):
        """Checks if the serial number is valid."""
        serialCheck = 0
        for i in range(len(serialNumber) - 1):
            serialCheck ^= serialNumber[i]
        return serialCheck == serialNumber[-1]

    def identify(self):
        """Receives the serial number of the card."""
        self.__MFRC522_write(self.BITFRAMINGREG, 0x00)  # All bits of the last byte
        buffer = self.MIFARE_ANTICOLCL1.copy()
        status, backData, backBits = self.__transceiveCard(buffer)
        if status == self.MIFARE_OK and self.__serialNumberValid(backData):
            status = self.MIFARE_OK
        else:
            status = self.MIFARE_ERR
        return status, backData, backBits

    def __transceiveCard(self, data):
        """Transceives data through the reader/writer from and to the card."""
        # Configure interrupts
        IRqInv = 0x80
        TxIEn = 0x40
        RxIEn = 0x20
        IdleIEn = 0x10
        LoAlertIEn = 0x04
        ErrIEn = 0x02
        TimerIEn = 0x01
        self.__MFRC522_write(
            self.COMIENREG,
            IRqInv | TxIEn | RxIEn | IdleIEn | LoAlertIEn | ErrIEn | TimerIEn,
        )

        # Clear ComIrqReg
        Set1 = 0x80
        self.__MFRC522_clearBitMask(self.COMIRQREG, Set1)

        # Flush FIFO
        FlushBuffer = 0x80
        self.__MFRC522_setBitMask(self.FIFOLEVELREG, FlushBuffer)

        # Cancel running commands
        self.__MFRC522_write(self.COMMANDREG, self.MFRC522_IDLE)

        # Write data to FIFO
        for byte in data:
            self.__MFRC522_write(self.FIFODATAREG, byte)

        # Start Transceive command
        self.__MFRC522_write(self.COMMANDREG, self.MFRC522_TRANSCEIVE)

        # Start sending
        StartSend = 0x80
        self.__MFRC522_setBitMask(self.BITFRAMINGREG, StartSend)

        # Wait for interrupt or timeout
        TimerIRq = 0x01
        RxIRq = 0x20
        IdleIRq = 0x10
        timeout = 2000
        while timeout > 0:
            comIRqReg = self.__MFRC522_read(self.COMIRQREG)
            if comIRqReg & (TimerIRq | RxIRq | IdleIRq):
                break
            timeout -= 1

        # Clear StartSend bit
        self.__MFRC522_clearBitMask(self.BITFRAMINGREG, StartSend)

        backData = []
        backBits = 0
        status = self.MIFARE_ERR

        if timeout > 0:
            # Check for errors
            BufferOvfl = 0x10
            ColErr = 0x08
            ParityErr = 0x02
            ProtocolErr = 0x01
            errorTest = BufferOvfl | ColErr | ParityErr | ProtocolErr
            errorReg = self.__MFRC522_read(self.ERRORREG)

            if (errorReg & errorTest) == 0:
                status = self.MIFARE_OK
                ErrIRq = 0x02
                if (comIRqReg & TimerIRq) and (comIRqReg & ErrIRq):
                    status = self.MIFARE_NOTAGERR

                fifoLevel = self.__MFRC522_read(self.FIFOLEVELREG)
                if fifoLevel == 0:
                    fifoLevel = 1
                if fifoLevel > self.MAX_LEN:
                    fifoLevel = self.MAX_LEN

                # Read last bits info
                RxLastBits = 0x08
                lastBits = self.__MFRC522_read(self.CONTROLREG) & RxLastBits
                if lastBits:
                    backBits = (fifoLevel - 1) * 8 + lastBits
                else:
                    backBits = fifoLevel * 8

                # Read FIFO data
                for _ in range(fifoLevel):
                    backData.append(self.__MFRC522_read(self.FIFODATAREG))

        return status, backData, backBits

    def __calculateCRC(self, data):
        """Uses the reader/writer to calculate CRC."""
        CRCIRq = 0x04
        self.__MFRC522_clearBitMask(self.DIVIRQREG, CRCIRq)

        FlushBuffer = 0x80
        self.__MFRC522_setBitMask(self.FIFOLEVELREG, FlushBuffer)

        for byte in data:
            self.__MFRC522_write(self.FIFODATAREG, byte)

        self.__MFRC522_write(self.COMMANDREG, self.MFRC522_CALCCRC)

        timeout = 255
        while timeout > 0:
            divirqreg = self.__MFRC522_read(self.DIVIRQREG)
            if divirqreg & CRCIRq:
                break
            timeout -= 1

        crc = [
            self.__MFRC522_read(self.CRCRESULTREGLSB),
            self.__MFRC522_read(self.CRCRESULTREGMSB),
        ]
        return crc

    def select(self, serialNumber):
        """Selects a card with a given serial number."""
        buffer = self.MIFARE_SELECTCL1.copy()
        buffer.extend(serialNumber[:5])  # UID is 4 or 7 bytes; MIFARE_CL1 uses 4
        crc = self.__calculateCRC(buffer)
        buffer.extend(crc)
        return self.__transceiveCard(buffer)

    def authenticate(self, mode, blockAddr, key, serialNumber):
        """Authenticates the card."""
        buffer = mode.copy()
        buffer.append(blockAddr)
        buffer.extend(key)
        buffer.extend(serialNumber[:4])
        return self.__authenticateCard(buffer)

    def deauthenticate(self):
        """Deauthenticates the card."""
        MFCrypto1On = 0x08
        self.__MFRC522_clearBitMask(self.STATUS2REG, MFCrypto1On)

    def __authenticateCard(self, data):
        """Internal authentication routine."""
        # Configure interrupts
        IRqInv = 0x80
        IdleIEn = 0x10
        ErrIEn = 0x02
        self.__MFRC522_write(self.COMIENREG, IRqInv | IdleIEn | ErrIEn)

        Set1 = 0x80
        self.__MFRC522_clearBitMask(self.COMIRQREG, Set1)

        FlushBuffer = 0x80
        self.__MFRC522_setBitMask(self.FIFOLEVELREG, FlushBuffer)

        self.__MFRC522_write(self.COMMANDREG, self.MFRC522_IDLE)

        for byte in data:
            self.__MFRC522_write(self.FIFODATAREG, byte)

        self.__MFRC522_write(self.COMMANDREG, self.MFRC522_MFAUTHENT)

        TimerIRq = 0x01
        RxIRq = 0x20
        IdleIRq = 0x10

        timeout = 2000
        while timeout > 0:
            comIRqReg = self.__MFRC522_read(self.COMIRQREG)
            if comIRqReg & (TimerIRq | RxIRq | IdleIRq):
                break
            timeout -= 1

        StartSend = 0x80
        self.__MFRC522_clearBitMask(self.BITFRAMINGREG, StartSend)

        status = self.MIFARE_ERR
        if timeout > 0:
            BufferOvfl = 0x10
            ColErr = 0x08
            ParityErr = 0x02
            ProtocolErr = 0x01
            errorTest = BufferOvfl | ColErr | ParityErr | ProtocolErr
            errorReg = self.__MFRC522_read(self.ERRORREG)

            if (errorReg & errorTest) == 0:
                status = self.MIFARE_OK
                ErrIRq = 0x02
                if (comIRqReg & TimerIRq) and (comIRqReg & ErrIRq):
                    status = self.MIFARE_NOTAGERR

        return status, [], 0

    def read(self, blockAddr):
        """Reads data from the card."""
        buffer = self.MIFARE_READ.copy()
        buffer.append(blockAddr)
        crc = self.__calculateCRC(buffer)
        buffer.extend(crc)
        return self.__transceiveCard(buffer)

    def write(self, blockAddr, data):
        """Writes data to the card."""
        buffer = self.MIFARE_WRITE.copy()
        buffer.append(blockAddr)
        crc = self.__calculateCRC(buffer)
        buffer.extend(crc)

        status, _, _ = self.__transceiveCard(buffer)
        if status != self.MIFARE_OK:
            return status, [], 0

        # Send data block
        buffer = data.copy()
        crc = self.__calculateCRC(buffer)
        buffer.extend(crc)
        return self.__transceiveCard(buffer)

    def __MFRC522_antennaOn(self):
        """Activates the reader/writer antenna."""
        value = self.__MFRC522_read(self.TXCONTROLREG)
        if (value & 0x03) == 0:
            self.__MFRC522_setBitMask(self.TXCONTROLREG, 0x03)

    def __MFRC522_antennaOff(self):
        """Deactivates the reader/writer antenna."""
        self.__MFRC522_clearBitMask(self.TXCONTROLREG, 0x03)

    def __MFRC522_reset(self):
        """Resets the reader/writer."""
        self.__MFRC522_write(self.COMMANDREG, self.MFRC522_SOFTRESET)

    def __MFRC522_init(self):
        """Initialization sequence."""
        self.__MFRC522_reset()

        # Timer configuration
        TAuto = 0x80
        TPrescaler_Hi = 0x0D
        TPrescaler_Lo = 0x3E
        self.__MFRC522_write(self.TMODEREG, TAuto | TPrescaler_Hi)
        self.__MFRC522_write(self.TPRESCALERREG, TPrescaler_Lo)

        TReloadVal_Hi = 0x1E
        TReloadVal_Lo = 0x00
        self.__MFRC522_write(self.TRELOADREGH, TReloadVal_Hi)
        self.__MFRC522_write(self.TRELOADREGL, TReloadVal_Lo)

        # ASK modulation
        Force100ASK = 0x40
        self.__MFRC522_write(self.TXASKREG, Force100ASK)

        # Mode register
        ResetVal = 0x3F
        FeatureMask = 0x14
        TxWaitRF = 0x20
        PolMFin = 0x08
        CRCPreset = 0x01
        self.__MFRC522_write(
            self.MODEREG, (ResetVal & FeatureMask) | TxWaitRF | PolMFin | CRCPreset
        )

        self.__MFRC522_antennaOn()
