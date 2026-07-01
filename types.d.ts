declare interface IErrorMessage {
    data: string;
    stack?: string;
}

declare interface ISuccessMessage {
    data: string;
}

declare interface IResult {
    success: boolean;
    message?: ISuccessMessage | IErrorMessage;
}

declare interface IConfig {
    name: string
    title: string
    version: string
    debug?: boolean
}

declare interface ITilesetDimensions {
    image: {
        width: number;
        height: number;
    },
    tileset: {
        tile: {
            width: number;
            height: number;
            spacing: number;
        },
        margin: number;
        rows: number;
        columns: number;
    }
}

declare interface IStride {
    horizontal: number;
    vertical: number;
}

declare interface IAnimationConfirmation {
    confirmation_button: Qt.QPushButton;
    animation_frames_input: Qt.QDoubleSpinBox;
    animation_frame_duration: Qt.QDoubleSpinBox;
    animation_direction: Qt.QComboBox;
    animation_stride_horizontal: Qt.QDoubleSpinBox;
    animation_stride_vertical: Qt.QDoubleSpinBox;
}