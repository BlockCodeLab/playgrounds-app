from popui.color import rgb565
from _stage_ import stage
import colorsys

PEN_PAINT = "PEN_PAINT"
PEN_COLOR = "PEN_COLOR"
PEN_SIZE = "PEN_SIZE"
PEN_LAST_POS = "PEN_LAST_POS"


def clear():
    stage.clear_paints(PEN_PAINT)


def stamp(target):
    image = memoryview(bytearray(target._image))
    x, y = round(target._x), round(target._y)
    width, height = round(target._width), round(target._height)
    stage.add_paint(
        PEN_PAINT,
        lambda disp: disp.blit(image, x, y, width, height, key=0x0000),
    )


def pen_goto(target, *args, **kwargs):
    target.__class__.goto(target, *args, **kwargs)
    x, y = target.data[PEN_LAST_POS]
    nx, ny = stage.CENTER_X + target.x, stage.CENTER_Y - target.y
    if x == nx and y == ny:
        return
    color = target.data.get(PEN_COLOR, (0, 0, 0))
    size = target.data.get(PEN_SIZE, 1)
    stage.add_paint(
        PEN_PAINT, lambda disp: disp.line(x, y, nx, ny, size, rgb565(*color))
    )
    target.data[PEN_LAST_POS] = nx, ny


def down(target):
    nx, ny = stage.CENTER_X + target.x, stage.CENTER_Y - target.y
    target.data[PEN_LAST_POS] = nx, ny
    target.goto = lambda *args, **kwargs: pen_goto(target, *args, **kwargs)


def up(target):
    target.goto = lambda *args, **kwargs: target.__class__.goto(target, *args, **kwargs)
    target.data[PEN_LAST_POS] = None


def set_color(target, color=None, hue=None, saturation=None, brightness=None):
    if color == None:
        r, g, b = target.data.get(PEN_COLOR, (0, 0, 0))
        h, s, v = colorsys.rgb_to_hsv(r, g, b)
        if hue != None:
            h = hue % 100 / 100
        if saturation != None:
            s = saturation % 100 / 100
        if brightness != None:
            v = brightness % 100 / 100
        r, g, b = colorsys.hsv_to_rgb(h, s, v)
        color = round(r), round(g), round(b)
    target.data[PEN_COLOR] = color


def change_color(target, hue=0, saturation=0, brightness=0):
    r, g, b = target.data.get(PEN_COLOR, (0, 0, 0))
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    h += hue % 100 / 100
    s += saturation % 100 / 100
    v += brightness % 100 / 100
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    target.data[PEN_COLOR] = round(r), round(g), round(b)


def set_size(target, size):
    target.data[PEN_SIZE] = size


def change_size(target, size):
    target.data[PEN_SIZE] = target.data.get(PEN_SIZE, 1) + size
