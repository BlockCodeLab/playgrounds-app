#pragma once
#include <Arduino.h>

#include "dht11.h"
#include "digit_display.h"

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

DHT11 dht;

int get_temperature(Port_t port) {
  int pin = Ports[port][0];
  dht.read(pin);
  return dht.temperature;
}

int get_humidity(Port_t port) {
  int pin = Ports[port][0];
  dht.read(pin);
  return dht.humidity;
}

DigitDisplay digit_display(DigitDisplay::kDeviceI2cAddress);

void init_segment() { digit_display.Setup(); }

void set_segment_digit(int pos, int digit) {
  digit_display.ShowDigitNumber(pos, digit, false);
}

void set_segment_number(int number, int float_number = 0) {
  float num = (float)number;
  int dot = 0;
  if (float_number > 100) {
    dot = 3;
    num += (float)(float_number) / 1000.0f;
  } else if (float_number > 10) {
    dot = 2;
    num += (float)(float_number) / 100.0f;
  } else if (float_number > 0) {
    dot = 1;
    num += (float)(float_number) / 10.0f;
  }
  digit_display.ShowNumber(num, dot);
}

void set_segment_colon(bool state) { digit_display.ShowColon(state); }

void clear_segment() { digit_display.Clear(); }

void draw_line();
void draw_circle();
void draw_triangle();
void draw_rectangle();
void draw_text();
void clear_oled();
