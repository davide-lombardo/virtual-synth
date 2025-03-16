// const Sequencer = () => {
//   const [state, dispatch] = useSequencerState();
  
//   const selectStep = (idx) => {
//     dispatch(ActionCreators.setSelectedStep(idx));
//   };
  
//   const renderSteps = (from, to) => {
//     const st = [];
//     for (let i = from; i < to; i++) {
//       let cn = 'sequencer-step' + (i % 4 === 0 ? ' bar' : '');
//       cn += (state.playingStepIndex === i) ? ' playing' : '';
//       cn += (state.selectedStepIndex === i) ? ' editing' : '';
      
//       st.push(
//         <button 
//           key={i}
//           className={cn}
//           onClick={() => selectStep(i)}
//         >
//           {(i % 4 === 0 ? i / 4 : i % 4) + 1}
//         </button>
//       );
//     }
//     return st;
//   };
  
//   return (
//     <div className="sequencer">
//       <div className="sequencer-row">
//         {renderSteps(0, 8)}
//       </div>
//       <div className="sequencer-row">
//         {renderSteps(8, 16)}
//       </div>
//     </div>
//   );
// };