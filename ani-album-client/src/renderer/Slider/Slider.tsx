import * as React from 'react';
import './Slider.scss';

export interface ISliderState {
  isMoving: boolean;
  offsetX: number;
}

const CircleRadius: number = 5;

class Slider extends React.Component<{}, ISliderState> {

  private __sliderRef: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props: {}) {
    super(props);
    this.state = {
      isMoving: false,
      offsetX: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleWindowMouseMove);
  }

  private stopMoving() {
    if (!this.state.isMoving) return;
    this.setState({
      isMoving: false,
    });
    window.removeEventListener('mousemove', this.handleWindowMouseMove);
  }

  private handleMouseUp = (e: Event) => {
    // console.log('mouse up');
    this.stopMoving();
  }

  private handleSlideMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    // console.log('slider mouse down');
    this.setState({
      isMoving: true,
    });
    window.addEventListener('mousemove', this.handleWindowMouseMove);
  }

  private handleWindowMouseMove = (e: MouseEvent) => {
    console.log('mouse move');
    const rect = this.__sliderRef.current.getBoundingClientRect();
    const mouseX = e.clientX;
    let ratio: number = 0;
    if (mouseX <= rect.x) {
      ratio = 0
    } else if (mouseX >= rect.x + rect.width) {
      ratio = 1;
    } else {
      ratio = (mouseX - rect.x) / rect.width;
    }
    this.setState({
      offsetX: Math.floor(rect.width * ratio),
    });
  }
  
  render() {
    const CircleWidth = CircleRadius * 2
    const { offsetX } = this.state;
    return (
      <div 
        className="ani-slider"
        onMouseDown={this.handleSlideMouseDown}
      >
        <div
          className="ani-slider-line"
          ref={this.__sliderRef}
        >
          <div
            className="ani-slider-circle"
            style={{
              borderRadius: `${CircleRadius}px`,
              width: `${CircleWidth}px`,
              height: `${CircleWidth}px`,
              transform: `translateX(${0 - CircleRadius + offsetX}px) translateY(-50%)`,
            }}
          >
          </div>
        </div>
      </div>
    )
  }

}

export default Slider;
