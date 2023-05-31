import enum


class ChatStatus(enum.Enum):
    asking = "asking"
    queueing = "queueing"
    idling = "idling"


class ChatModels(enum.Enum):
    gpt3_mobile = "text-davinci-002-render-sha-mobile"
    gpt4 = "gpt-4"
    gpt4_mobile = "gpt-4-mobile"
    gpt4_browsing = "gpt-4-browsing"
    gpt4_plugins = "gpt-4-plugins"
    default = "text-davinci-002-render-sha"
    paid = "text-davinci-002-render-paid"
    unknown = ""
