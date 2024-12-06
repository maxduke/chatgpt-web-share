from enum import auto

from strenum import StrEnum


class ChatSourceTypes(StrEnum):
    openai_web = auto()
    openai_api = auto()


def get_model_code_mapping(source_cls):
    from api.conf import Config

    cls_to_source = {
        "OpenaiWebChatModels": ChatSourceTypes.openai_web,
        "OpenaiApiChatModels": ChatSourceTypes.openai_api,
    }
    source = cls_to_source.get(source_cls.__name__, None)
    source_model_code_mapping = {
        "openai_web": Config().openai_web.model_code_mapping,
        "openai_api": Config().openai_api.model_code_mapping,
    }
    return source_model_code_mapping[source]


class BaseChatModelEnum(StrEnum):
    def code(self):
        result = get_model_code_mapping(self.__class__).get(self.name, None)
        assert result, f"model name not found: {self.name}"
        return result

    @classmethod
    def from_code(cls, code: str):
        for name, value in get_model_code_mapping(cls).items():
            if value == code:
                return cls[name]
        return None


class OpenaiWebChatModels(BaseChatModelEnum):
    gpt_3_5 = auto()
    gpt_4 = auto()
    gpt_4o = auto()
    o1 = auto()
    o1_mini = auto()


class OpenaiApiChatModels(BaseChatModelEnum):
    gpt_3_5 = auto()
    gpt_4 = auto()
    gpt_4o = auto()
    o1 = auto()
    o1_mini = auto()
    claude_3_haiku = auto()
    claude_3_5_sonnet = auto()


if __name__ == "__main__":
    print(list(OpenaiWebChatModels))
