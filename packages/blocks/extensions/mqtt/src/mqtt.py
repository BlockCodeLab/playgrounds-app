from micropython import const
from umqtt.simple import MQTTClient

try:
    from scratch import runtime, when_frame
except Exception:
    from blocks import runtime, when_frame


mqtt_client = None
messages = {}


@when_frame
async def wait_msg():
    if mqtt_client:
        mqtt_client.check_msg()


def sub_cb(topic, msg):
    messages[topic] = msg


def connect(server):
    global mqtt_client
    mqtt_client = MQTTClient("mqtt_client", server)


def subscribe(topic):
    messages.setdefault(topic, "")


def publish(topic, msg):
    if mqtt_client:
        mqtt_client.publish(topic, msg)
