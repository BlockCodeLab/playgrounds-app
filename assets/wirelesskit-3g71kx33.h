#pragma once
#include <Arduino.h>
#include <HT16K33.h>
#include <dht.h>

typedef enum {
  P1,
  P2,
  P3,
  P4,
  P5,
  P6,
  P7,
  P8,
  P9,
  P10,
  P11,
  P12,
  P13,
  P14,
  P15,
  P16,
  PORT_COUNT,
} Port_t;

int Ports[PORT_COUNT][4] = {
    {A3, 0, 0, 0}, {A2, 0, 0, 0},  {A1, 0, 0, 0},  {A0, 0, 0, 0},
    {A0, 7, 0, 0}, {A1, 8, 0, 0},  {12, 13, 0, 0}, {5, 6, 0, 0},
    {3, 0, 0, 0},  {4, 0, 0, 0},   {11, 0, 0, 0},  {2, 0, 0, 0},
    {5, 6, 9, 10}, {A0, A1, 7, 0}, {9, 10, 11, 0}, {13, 2, 11, 0}};

void init_led(Port_t port) {
  int pin = Ports[port][0];
  pinMode(pin, OUTPUT);
}

void set_led(Port_t port, bool state) {
  int pin = Ports[port][0];
  digitalWrite(pin, state ? HIGH : LOW);
}

void toggle_led(Port_t port) {
  int pin = Ports[port][0];
  int state = digitalRead(pin);
  digitalWrite(pin, state ? LOW : HIGH);
}

void init_buzzer(Port_t port) { init_led(port); }

void set_buzzer(Port_t port, bool state) { set_led(port, state); }

void init_motor(Port_t port) {
  int pina = Ports[port][0];
  int pinb = Ports[port][1];
  pinMode(pina, OUTPUT);
  pinMode(pinb, OUTPUT);
}

void set_motor(Port_t port, int dir, int speed = 0) {
  int pina = Ports[port][0];
  int pinb = Ports[port][1];
  int value = map(speed, 0, 100, 0, 255);
  if (dir == -1) {
    analogWrite(pina, 0);
    analogWrite(pinb, value);
  } else {
    analogWrite(pina, value);
    analogWrite(pinb, 0);
  }
}

void stop_motor(Port_t port) {
  int pina = Ports[port][0];
  int pinb = Ports[port][1];
  analogWrite(pina, 0);
  analogWrite(pinb, 0);
}

void init_key(Port_t port) {
  int pin = Ports[port][0];
  pinMode(pin, INPUT);
}

bool is_keypressed(Port_t port) {
  int pin = Ports[port][0];
  return digitalRead(pin) == LOW;
}

void init_sound(Port_t port) {
  int apin = Ports[port][0];
  int dpin = Ports[port][1];
  pinMode(apin, INPUT);
  pinMode(dpin, INPUT);
}

bool is_sound(Port_t port) {
  int dpin = Ports[port][1];
  return digitalRead(dpin) == LOW;
}

int get_sound(Port_t port) {
  int apin = Ports[port][0];
  return analogRead(apin);
}

void init_potentiometer(Port_t port) {
  int pin = Ports[port][0];
  pinMode(pin, INPUT);
}

int get_potentiometer(Port_t port) {
  int pin = Ports[port][0];
  return map(analogRead(pin), 0, 1023, 0, 100);
}

void init_photosensitive(Port_t port) {
  int pin = Ports[port][0];
  pinMode(pin, INPUT);
}

int get_photosensitive(Port_t port) {
  int pin = Ports[port][0];
  return map(analogRead(pin), 0, 1023, 0, 1000);
}

void init_distance(Port_t port) {
  int pin = Ports[port][0];
  pinMode(pin, INPUT);
}

int get_distance(Port_t port) {
  int pin = Ports[port][0];
  pinMode(pin, OUTPUT);
  digitalWrite(pin, HIGH);
  delayMicroseconds(100);
  digitalWrite(pin, LOW);
  pinMode(pin, INPUT);
  return pulseIn(pin, HIGH, 500000) / 58.0f;
}

dht DHT;

int get_temperature(Port_t port) {
  int pin = Ports[port][0];
  DHT.read11(pin);
  return DHT.temperature;
}

int get_humidity(Port_t port) {
  int pin = Ports[port][0];
  DHT.read11(pin);
  return DHT.humidity;
}

HT16K33 ht16k33(0x70);

void init_segment() {
  Wire.begin();
  ht16k33.begin();
}

void set_segment_digit(int pos, int digit) {}

void set_segment_number(float number) {
  ht16k33.setDigits(1);
  ht16k33.displayColon(0);

  char buffer[15];
  dtostrf(number, 0, 3, buffer);
  char *dot = strchr(buffer, '.');

  if (dot == NULL) {
    ht16k33.displayInt((int)number);
    return;
  }

  char *frac = dot + 1;
  int len = strlen(frac);
  while (len > 0 && frac[len - 1] == '0') {
    len--;
  }
  len > 0 ? ht16k33.displayFloat(number, len) : ht16k33.displayInt((int)number);
}

void set_segment_time(int hour, int minute) {
  ht16k33.suppressLeadingZeroPlaces(0);
  ht16k33.displayTime(hour, minute);
}

void set_segment_colon(int state) { ht16k33.displayColon(state); }

void clear_segment() { ht16k33.displayClear(); }
