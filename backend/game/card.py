class Card:

    def __init__(self, value: int, card_type: str, color: str=None, color_bound: bool=True, variants: list=[]):
        self.value = value # ~1-100
        self.round_value = value # To modif if e.g. is trump
        self.card_type = card_type # 1-13, wizard, fool, dragon, ...

        self.color = color
        self.color_bound = False if not color else color_bound # tells if following cards have to admit color / color is relevant for admission
        
        self.id = card_type if not color else "_".join((color, str(card_type))) 

        self.variants = variants

    def is_playable(self, lead_color: str):
        return not self.color_bound or self.color == lead_color

    def __str__(self):
        return self.id

    def __repr__(self):
        return self.id