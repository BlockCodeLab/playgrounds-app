from popui.color import rgb565
from scratch import runtime
from _stage_ import stage
import colorsys
import math

PEN_PAINT = "PEN_PAINT"
PEN_COLOR = "PEN_COLOR"
PEN_SIZE = "PEN_SIZE"
PEN_LAST_POS = "PEN_LAST_POS"

num = runtime.number


def clear():
    stage.clear_paints(PEN_PAINT)


def stamp(target):
    frame_module = target.frames[target.frame_index]
    image = frame_module.BITMAP
    x, y = target._x, target._y
    width, height, cx, cy = target._width, target._height, target._cx, target._cy
    angle = target.direction - 90
    scale_x = scale_y = target.size / 100
    if target.rotation_style == 0:
        angle = 0
    elif target.rotation_style == 1:
        angle = 0
        if target.direction < 0:
            scale_x = -scale_x
    alpha = target.alpha
    stage.add_paint(
        PEN_PAINT,
        lambda disp: disp.blit(
            image,
            round(x),
            round(y),
            width,
            height,
            cx=cx,
            cy=cy,
            angle=math.radians(angle),
            scale_x=scale_x,
            scale_y=scale_y,
            key=0x0000,
            alpha=alpha,
        ),
    )
    runtime.request_render()


def pen_goto(target, *args, **kwargs):
    target.__class__.goto(target, *args, **kwargs)
    x, y = target.data[PEN_LAST_POS]
    nx, ny = stage.CENTER_X + target.x, stage.CENTER_Y - target.y
    if x == nx and y == ny:
        return
    color = target.data.get(PEN_COLOR, (1, 0, 0))
    size = target.data.get(PEN_SIZE, 1)
    stage.add_paint(
        PEN_PAINT,
        lambda disp: disp.line(
            round(x), round(y), round(nx), round(ny), size, rgb565(*color)
        ),
    )
    target.data[PEN_LAST_POS] = nx, ny


def down(target):
    x, y = stage.CENTER_X + target.x, stage.CENTER_Y - target.y
    target.data[PEN_LAST_POS] = x, y
    target.goto = lambda *args, **kwargs: pen_goto(target, *args, **kwargs)


def up(target):
    target.goto = lambda *args, **kwargs: target.__class__.goto(target, *args, **kwargs)
    target.data[PEN_LAST_POS] = None


def set_color(target, color=None, hue=None, saturation=None, brightness=None):
    if color is None:
        r, g, b = target.data.get(PEN_COLOR, (255, 0, 0))
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if hue is not None:
            if type(hue) is str:
                hue = num(hue)
            h = hue % 101 / 100
        if saturation is not None:
            if type(saturation) is str:
                saturation = num(saturation)
            s = saturation % 101 / 100
        if brightness is not None:
            if type(brightness) is str:
                brightness = num(brightness)
            v = brightness % 101 / 100
        r, g, b = colorsys.hsv_to_rgb(h, s, v)
        color = round(r * 255), round(g * 255), round(b * 255)
    target.data[PEN_COLOR] = color


def change_color(target, hue=0, saturation=0, brightness=0):
    if type(hue) is str:
        hue = num(hue)
    if type(saturation) is str:
        saturation = num(saturation)
    if type(brightness) is str:
        brightness = num(brightness)
    r, g, b = target.data.get(PEN_COLOR, (255, 0, 0))
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    h = (h * 100 + hue) % 101 / 100
    s = (s * 100 + saturation) % 101 / 100
    v = (v * 100 + brightness) % 101 / 100
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    color = round(r * 255), round(g * 255), round(b * 255)
    target.data[PEN_COLOR] = color


def set_size(target, size):
    target.data[PEN_SIZE] = size


def change_size(target, size):
    target.data[PEN_SIZE] = target.data.get(PEN_SIZE, 1) + size
