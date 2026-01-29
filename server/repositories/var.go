documents := processor.ProcessorDocuments{}
for _, e := range eventArray.Events {
event, err := events.Unmarshal(e)
if err != nil {
err = fmt.Errorf("error unmarshaling event: %w", err)
documents.ProcDocs = append(documents.ProcDocs, &processor.Document{
Key: event.Key(),
DataType: eventsWorkingDataType,
Err: err,
})
_ = level.Error(mp.MsgProcessor.Logger).Log("error", err)
span.RecordError(err)
continue
}
